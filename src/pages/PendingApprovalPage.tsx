import { Gavel, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

export default function PendingApprovalPage() {
  const { signOut, profile } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8 text-center">
          <div className="h-16 w-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center mx-auto mb-4">
            <Clock className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">Menunggu Persetujuan</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Akun Anda ({profile?.email}) sedang menunggu persetujuan dari admin. Anda akan mendapat akses setelah akun disetujui.
          </p>
          {profile?.approval_status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-700 font-medium">Akun Anda ditolak. Silakan hubungi admin.</p>
            </div>
          )}
          <Button variant="outline" onClick={signOut} className="w-full">
            Keluar
          </Button>
        </div>
      </div>
    </div>
  );
}
