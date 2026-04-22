import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navigation } from './Navigation';
import { LogOut } from 'lucide-react';
import { signOut } from '../lib/firebase';

export const Layout: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-md mx-auto shadow-xl relative overflow-hidden">
      {/* Header */}
      <header className="bg-white px-4 py-4 shadow-sm flex justify-between items-center z-10 sticky top-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-emerald-600">EzyAbsen</h1>
          <p className="text-xs text-gray-500 truncate max-w-[200px]">Halo, {profile?.name || 'Karyawan'}</p>
        </div>
        <button 
          onClick={signOut}
          className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-gray-50 rounded-full"
          title="Keluar"
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 relative">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 w-full z-20">
        <Navigation />
      </div>
    </div>
  );
};
