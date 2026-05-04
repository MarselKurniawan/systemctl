// Proxy untuk fetch image dari storage external (yang tidak punya CORS) dan
// kembalikan sebagai base64 data URL agar bisa di-embed ke PDF.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { url } = await req.json();
    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "url required" }), { status: 400, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
    const res = await fetch(url);
    if (!res.ok) {
      return new Response(JSON.stringify({ error: `upstream ${res.status}` }), { status: 502, headers: { ...corsHeaders, "content-type": "application/json" } });
    }
    const contentType = res.headers.get("content-type") || "image/jpeg";
    const buf = new Uint8Array(await res.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i++) bin += String.fromCharCode(buf[i]);
    const base64 = btoa(bin);
    return new Response(JSON.stringify({ dataUrl: `data:${contentType};base64,${base64}` }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "content-type": "application/json" } });
  }
});
