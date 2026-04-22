import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { FileText, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';

export const Leave: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [type, setType] = useState('sick');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'leaveRequests'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setRequests(data.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !startDate || !endDate || !reason) return;
    setSubmitting(true);
    
    try {
      const docId = `LR_${user.uid}_${Date.now()}`;
      await setDoc(doc(db, 'leaveRequests', docId), {
        userId: user.uid,
        type,
        startDate,
        endDate,
        reason,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setShowForm(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      fetchRequests();
    } catch (err) {
      console.error(err);
      alert('Gagal mengirim pengajuan.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'approved': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'rejected': return <XCircle className="text-red-500" size={18} />;
      default: return <Clock className="text-amber-500" size={18} />;
    }
  };

  const getStatusText = (status: string) => {
    switch(status) {
      case 'approved': return 'Disetujui';
      case 'rejected': return 'Ditolak';
      default: return 'Menunggu';
    }
  };

  return (
    <div className="p-4 bg-gray-50 min-h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Izin & Cuti</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-emerald-100 text-emerald-700 px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 active:scale-95 transition-transform"
        >
          {showForm ? 'Batal' : <><Plus size={16} /> Buat Baru</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Form Pengajuan</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">Jenis Cuti/Izin</label>
              <select 
                value={type} onChange={(e) => setType(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="sick">Sakit</option>
                <option value="annual">Cuti Tahunan</option>
                <option value="permit">Izin Lainnya</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">Dari Tanggal</label>
                <input 
                  type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">Sampai Tanggal</label>
                <input 
                  type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">Alasan</label>
              <textarea 
                required value={reason} onChange={(e) => setReason(e.target.value)}
                placeholder="Tuliskan keterangan detail..." rows={3}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
            <button 
              type="submit" disabled={submitting}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl disabled:bg-gray-300 transition-colors shadow-md shadow-emerald-200"
            >
              {submitting ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Memuat riwayat...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 px-6">
          <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-400">
            <FileText size={32} />
          </div>
          <p className="text-gray-500 font-medium">Belum ada riwayat pengajuan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} className="bg-white p-4 rounded-xl shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded w-fit
                  ${req.type === 'sick' ? 'bg-red-50 text-red-600' : req.type === 'annual' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}
                `}>
                  {req.type === 'sick' ? 'Sakit' : req.type === 'annual' ? 'Cuti Tahunan' : 'Izin'}
                </span>
                <div className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                  {getStatusIcon(req.status)}
                  {getStatusText(req.status)}
                </div>
              </div>
              
              <div className="text-sm font-semibold text-gray-800 mt-2">
                {format(new Date(req.startDate), 'dd MMM yyyy', {locale: localeId})} 
                {req.startDate !== req.endDate && ` - ${format(new Date(req.endDate), 'dd MMM yyyy', {locale: localeId})}`}
              </div>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{req.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
