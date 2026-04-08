import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Verify caller
  const callerClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } }, auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { data: { user: caller } } = await callerClient.auth.getUser();
  if (!caller) {
    return new Response(JSON.stringify({ error: "Invalid token" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: callerRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", caller.id).single();
  if (!callerRole || !["superadmin", "admin", "lawyer"].includes(callerRole.role)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const { action, user_id, profile_data, new_role, role } = body;

  // Lawyers can only create virtual clients
  if (callerRole.role === "lawyer" && !["insert_role", "create_virtual_client"].includes(action)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // insert_role action - for virtual clients (no auth user)
  if (action === "insert_role") {
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id, role: role || "client" });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // create_virtual_client - create profile + role for walk-in client without auth account
  if (action === "create_virtual_client") {
    const virtualUserId = crypto.randomUUID();
    const pd = body.profile_data || {};
    const { error: profErr } = await supabaseAdmin.from("profiles").insert({
      user_id: virtualUserId,
      nama: pd.nama || "",
      nik: pd.nik || null,
      nomor_wa: pd.nomor_wa || null,
      tanggal_lahir: pd.tanggal_lahir || null,
      jenis_kelamin: pd.jenis_kelamin || null,
      penyandang_disabilitas: pd.penyandang_disabilitas || false,
      approval_status: "approved",
      approved_at: new Date().toISOString(),
    });
    if (profErr) {
      return new Response(JSON.stringify({ error: profErr.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    await supabaseAdmin.from("user_roles").insert({ user_id: virtualUserId, role: "client" });
    return new Response(JSON.stringify({ success: true, userId: virtualUserId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Admin cannot modify admin/superadmin users
  if (callerRole.role === "admin") {
    const { data: targetRole } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user_id).single();
    if (targetRole && ["admin", "superadmin"].includes(targetRole.role)) {
      return new Response(JSON.stringify({ error: "Admin cannot modify admin/superadmin" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  if (action === "update") {
    // Update profile
    if (profile_data) {
      const { error } = await supabaseAdmin.from("profiles").update(profile_data).eq("user_id", user_id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    // Update role if provided (superadmin only)
    if (new_role && callerRole.role === "superadmin") {
      await supabaseAdmin.from("user_roles").update({ role: new_role }).eq("user_id", user_id);
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (action === "delete") {
    // Delete auth user (cascades to profiles and user_roles)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Invalid action" }), {
    status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
