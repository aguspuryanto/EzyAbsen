import React from 'react';
import { signInWithGoogle } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Fingerprint, Building2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const [error, setError] = React.useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = React.useState(false);

  if (loading) {
    return <div className="min-h-screen bg-gray-50" />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async () => {
    try {
      setIsLoggingIn(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError('Gagal masuk. Silakan coba lagi.');
      console.error(err);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 max-w-md mx-auto relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-50 transform translate-x-1/2 translate-y-1/2"></div>

      <div className="w-full relative z-10">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden shadow-emerald-900/5">
          <div className="p-8 text-center bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
              <Fingerprint size={48} className="text-white" strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">EzyAbsen</h1>
            <p className="text-emerald-50 text-sm font-medium">Solusi Absensi UMKM</p>
          </div>
          
          <div className="p-8">
            <div className="mb-8 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-gray-600 bg-gray-50 py-2 px-4 rounded-full text-sm inline-flex mx-auto">
                <Building2 size={16} />
                <span>Masuk untuk mulai absen</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 text-center border border-red-100">
                {error}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl font-medium transition-all shadow-lg shadow-emerald-200 active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:active:scale-100"
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5 bg-white rounded-full p-0.5 mt-0.5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Lanjutkan dengan Google
                </>
              )}
            </button>
            <p className="mt-6 text-center text-xs text-gray-400">
              Dengan masuk, kamu menyetujui<br/>Syarat & Ketentuan aplikasi
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
