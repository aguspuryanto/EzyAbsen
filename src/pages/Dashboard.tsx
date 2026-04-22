import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Clock, MapPin, CheckCircle, Clock3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { profile, user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTodayAttendance = async () => {
      if (!user) return;
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const q = query(
          collection(db, 'attendances'),
          where('userId', '==', user.uid),
          where('date', '==', today),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          setTodayAttendance({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
        }
      } catch (error) {
        console.error("Error fetching today's attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTodayAttendance();
  }, [user]);

  const currentTime = new Date();
  const greeting = currentTime.getHours() < 12 ? 'Selamat Pagi' : currentTime.getHours() < 15 ? 'Selamat Siang' : currentTime.getHours() < 18 ? 'Selamat Sore' : 'Selamat Malam';

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Banner */}
      <div className="bg-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-emerald-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
        <h2 className="text-2xl font-bold mb-1">{greeting},</h2>
        <p className="text-emerald-50 mb-4">{profile?.name}</p>
        <p className="text-sm font-medium tracking-wide">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: id })}
        </p>
      </div>

      {/* Attendance Status */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Status Hari Ini</h3>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ) : todayAttendance ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Masuk</p>
                  <p className="text-lg font-bold text-gray-900">
                    {format(todayAttendance.checkInTime.toDate(), 'HH:mm')}
                  </p>
                </div>
              </div>
              {todayAttendance.checkOutTime ? (
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <LogOutIcon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pulang</p>
                    <p className="text-lg font-bold text-gray-900">
                      {format(todayAttendance.checkOutTime.toDate(), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ) : (
                <Link to="/attendance" className="block w-full text-center py-3 bg-gray-50 hover:bg-gray-100 text-emerald-700 font-medium rounded-xl transition-colors mt-2">
                  Absen Pulang Sekarang
                </Link>
              )}
            </div>
          ) : (
             <div className="text-center py-4">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Clock3 className="text-gray-400" size={32} />
               </div>
               <p className="text-gray-600 font-medium mb-1">Belum Absen Masuk</p>
               <p className="text-sm text-gray-400 mb-4">Ayo absen tepat waktu hari ini</p>
               <Link to="/attendance" className="inline-block px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-full transition-colors shadow-md shadow-emerald-200">
                 Absen Sekarang
               </Link>
             </div>
          )}
        </div>
      </div>

      {/* Quick Menu */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">Menu Cepat</h3>
        <div className="grid grid-cols-2 gap-3">
          <Link to="/leave" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <FileIcon size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Pengajuan Izin</span>
          </Link>
          <Link to="/reports" className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <ReportIcon size={24} />
            </div>
            <span className="text-sm font-medium text-gray-700">Laporan</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

// Lucide icon placeholders
function LogOutIcon(props: any) { return <Clock {...props} />; }
function FileIcon(props: any) { return <Clock3 {...props} />; }
function ReportIcon(props: any) { return <Clock3 {...props} />; }
