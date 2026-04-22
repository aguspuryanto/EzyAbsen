import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { format, subDays, startOfMonth, endOfMonth, isSameDay } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { Calendar, Clock, CheckCircle, ExternalLink } from 'lucide-react';

export const Reports: React.FC = () => {
  const { user } = useAuth();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        // Just fetch last 30 days for simplicity in MVP
        const d = new Date();
        const start = format(subDays(d, 30), 'yyyy-MM-dd');
        
        const q = query(
          collection(db, 'attendances'), 
          where('userId', '==', user.uid),
          where('date', '>=', start)
        );
        const snap = await getDocs(q);
        const list = snap.docs.map(d => ({id: d.id, ...(d.data() as any)}));
        list.sort((a, b) => b.date.localeCompare(a.date));
        setAttendances(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [user]);

  // Dummy stats
  const totalPresent = attendances.length;
  const totalLate = attendances.filter(a => a.status === 'late').length;

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-6">Laporan Kehadiran</h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <CheckCircle size={16} className="text-emerald-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Hadir</span>
          </div>
          <div className="text-3xl font-light text-gray-900">{totalPresent} <span className="text-sm font-medium text-gray-400">hari</span></div>
        </div>
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 text-gray-500 mb-2">
            <Clock size={16} className="text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wide">Terlambat</span>
          </div>
          <div className="text-3xl font-light text-gray-900">{totalLate} <span className="text-sm font-medium text-gray-400">hari</span></div>
        </div>
      </div>

      <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between mb-6">
         <div>
           <p className="text-sm font-semibold text-emerald-800">Export ke Payroll</p>
           <p className="text-xs text-emerald-600 mt-0.5">Format Excel tersinkronisasi</p>
         </div>
         <button className="bg-white p-2 rounded-lg text-emerald-600 shadow-sm border border-emerald-100 active:scale-95 transition-transform" title="Belum tersedia di versi demo">
           <ExternalLink size={18} />
         </button>
      </div>

      {/* History List */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Riwayat 30 Hari Terakhir</h3>
        <div className="space-y-3">
          {loading ? (
             <div className="text-center py-8 text-gray-400">Memuat data...</div>
          ) : attendances.length === 0 ? (
             <div className="text-center py-8 text-gray-400">Belum ada riwayat</div>
          ) : (
            attendances.map(a => (
              <div key={a.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-800">
                    {format(new Date(a.date), 'EEEE, dd MMM', {locale: localeId})}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span>Masuk: <strong className="text-gray-700">{format(a.checkInTime.toDate(), 'HH:mm')}</strong></span>
                    {a.checkOutTime && (
                      <span>Pulang: <strong className="text-gray-700">{format(a.checkOutTime.toDate(), 'HH:mm')}</strong></span>
                    )}
                  </div>
                </div>
                <div className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded
                  ${a.status === 'late' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-50 text-emerald-600'}
                `}>
                  {a.status === 'late' ? 'Terlambat' : 'Tepat'}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
