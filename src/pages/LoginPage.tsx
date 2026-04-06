import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';
import legalEmblem from '@/assets/legal-emblem.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Email dan password wajib diisi');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#1a3a2a' }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl shadow-2xl p-8 border" style={{ backgroundColor: '#1e5c3a', borderColor: '#2a7a4e' }}>
          {/* Brand */}
          <div className="flex flex-col items-center mb-8">
            <img src={legalEmblem} alt="Bantuan Hukum Online" width={100} height={100} className="mb-2" />
            <h1 className="text-2xl font-bold text-white">
              Bantuan Hukum <span style={{ color: '#d4a017' }}>Online</span>
            </h1>
            <p className="text-sm mt-1" style={{ color: '#a0c4b0' }}>Masuk ke akun Anda</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#a0c4b0' }} />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Email"
                  className="pl-10 bg-white border-0 text-foreground h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#a0c4b0' }} />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 bg-white border-0 text-foreground h-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#a0c4b0' }}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 font-bold text-base border-0"
              style={{ backgroundColor: '#d4a017', color: '#1a3a2a' }}
              disabled={loading}
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: '#a0c4b0' }}>
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold hover:underline" style={{ color: '#d4a017' }}>Daftar Akun!!</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
