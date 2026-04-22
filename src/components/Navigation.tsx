import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, FileText, PieChart } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export const Navigation: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Beranda' },
    { to: '/attendance', icon: Camera, label: 'Absen' },
    { to: '/leave', icon: FileText, label: 'Izin/Cuti' },
    { to: '/reports', icon: PieChart, label: 'Laporan' },
  ];

  return (
    <nav className="bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] px-6 py-3 flex justify-between items-center rounded-t-2xl relative">
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center gap-1 min-w-[64px] transition-all duration-200",
              isActive ? "text-emerald-600 font-semibold translate-y-[-4px]" : "text-gray-400 font-medium hover:text-emerald-500"
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                "p-2 rounded-xl transition-colors duration-200", 
                isActive ? "bg-emerald-50 text-emerald-600" : "bg-transparent text-gray-400"
              )}>
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};
