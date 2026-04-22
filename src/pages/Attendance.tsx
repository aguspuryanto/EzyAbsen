import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { format } from 'date-fns';
import { Camera, MapPin, CheckCircle, RefreshCcw, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Attendance: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locError, setLocError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Check today's attendance status
  useEffect(() => {
    const fetchToday = async () => {
      if (!user) return;
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const q = query(collection(db, 'attendances'), where('userId', '==', user.uid), where('date', '==', today));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setTodayRecord({ id: snap.docs[0].id, ...snap.docs[0].data() });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchToday();
  }, [user]);

  // Start Camera
  const startCamera = async () => {
    try {
      if (stream) return;
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' }, audio: false 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setLocError("Gagal mengakses kamera. Izinkan akses kamera di browser.");
    }
  };

  // Stop Camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (!todayRecord || !todayRecord.checkOutTime) {
      startCamera();
      // Get Location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          },
          (err) => {
            console.error("Geolocation error:", err);
            setLocError("Gagal mendapatkan lokasi. Izinkan akses GPS.");
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocError("Peramban Anda tidak mendukung GPS.");
      }
    }
    return () => stopCamera();
  }, [todayRecord]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw image, optionally apply some overlay like timestamp
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        ctx.font = "24px sans-serif";
        ctx.fillStyle = "white";
        ctx.fillText(format(new Date(), 'dd MMM yyyy HH:mm'), 20, canvas.height - 30);

        setPhotoData(canvas.toDataURL('image/jpeg', 0.8));
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setPhotoData(null);
    startCamera();
  };

  const handleSubmit = async () => {
    if (!user || !photoData || !location) return;
    setSubmitting(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // We would normally upload photoData to Storage here. 
      // Bypassing directly storing base64 for simplicity if size < 1MB,
      // but in real app, definitely use Firebase Storage!
      // Here we assume photoUrl is a placeholder for actual CDN URL.
      const fakePhotoUrl = `https://picsum.photos/seed/${user.uid}/400/300`;

      if (!todayRecord) {
        // Create Check In
        const attendanceId = `${user.uid}_${today}`;
        await setDoc(doc(db, 'attendances', attendanceId), {
          userId: user.uid,
          date: today,
          checkInTime: serverTimestamp(),
          checkInLocation: location,
          checkInPhotoUrl: fakePhotoUrl,
          status: 'present', // would calculate based on time
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Create Check Out
        await updateDoc(doc(db, 'attendances', todayRecord.id), {
          checkOutTime: serverTimestamp(),
          checkOutLocation: location,
          checkOutPhotoUrl: fakePhotoUrl,
          updatedAt: serverTimestamp()
        });
      }
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan absensi');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;

  if (todayRecord?.checkOutTime) {
    return (
      <div className="p-6 text-center mt-10">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600">
          <CheckCircle size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Absensi Selesai</h2>
        <p className="text-gray-500">Anda sudah menyelesaikan absensi hari ini. Terima kasih!</p>
      </div>
    );
  }

  const isCheckOut = !!todayRecord;

  return (
    <div className="flex flex-col min-h-screen bg-black relative">
      {/* Header overlaid on camera */}
      <div className="absolute top-0 w-full z-20 p-4 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center text-white">
        <h2 className="font-semibold text-lg">{isCheckOut ? 'Absen Pulang' : 'Absen Masuk'}</h2>
        <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-xs font-medium border border-emerald-500/30">
          {format(new Date(), 'HH:mm')}
        </span>
      </div>

      {locError && (
        <div className="absolute top-16 left-4 right-4 z-20 bg-amber-50 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle size={18} className="shrink-0 mt-0.5" />
          <p>{locError}</p>
        </div>
      )}

      {/* Viewfinder */}
      <div className="flex-1 relative bg-gray-900 overflow-hidden flex items-center justify-center">
        {!photoData ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <img src={photoData} alt="Selfie" className="w-full h-full object-cover" />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-20 pb-20 pt-6 px-6 relative">
        <div className="flex items-center gap-3 mb-6 bg-gray-50 p-3 rounded-xl">
          <div className={`p-2 rounded-lg ${location ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-400'}`}>
            <MapPin size={20} />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-medium">GPS Location</p>
            <p className="text-sm font-semibold truncate text-gray-800">
              {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : 'Mencari lokasi...'}
            </p>
          </div>
        </div>

        <div className="flex justify-center items-center gap-6">
          {photoData ? (
            <>
              <button onClick={retakePhoto} type="button" className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 active:scale-95 transition-all">
                <RefreshCcw size={24} />
              </button>
              <button 
                onClick={handleSubmit} 
                disabled={submitting || !location}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 active:scale-95 transition-all flex justify-center items-center gap-2"
              >
                {submitting ? 'Menyimpan...' : `Kirim ${isCheckOut ? 'Pulang' : 'Masuk'}`}
              </button>
            </>
          ) : (
            <button 
              onClick={takePhoto} 
              className="w-20 h-20 rounded-full border-4 border-emerald-100 bg-emerald-500 flex items-center justify-center text-white shadow-lg active:scale-95 transition-all"
            >
              <Camera size={32} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
