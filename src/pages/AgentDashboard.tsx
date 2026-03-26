import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMapPin, FiBox, FiUser, FiCheck, FiDollarSign, FiClock } from 'react-icons/fi';
import axios from 'axios';

const API_URL = '/api/agent';

interface ScrapRequest {
  _id: string;
  user: { name: string; email: string };
  scrapType: string;
  estimatedWeightKg: number;
  address: string;
  status: string;
  collectedWeightKg?: number;
  collectedAmount?: number;
}

export default function AgentDashboard() {
  const [requests, setRequests] = useState<ScrapRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [collectModalOpen, setCollectModalOpen] = useState(false);
  const [activePickupId, setActivePickupId] = useState<string | null>(null);
  const [collectedWeight, setCollectedWeight] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');

      const res = await axios.get(`${API_URL}/pickups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(res.data.requests || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load pickups');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      await axios.post(`${API_URL}/accept-pickup`, { pickupId: id }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.map(r => r._id === id ? { ...r, status: 'accepted' } : r));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept pickup');
    }
  };

  const openCollectModal = (id: string) => {
    setActivePickupId(id);
    setCollectedWeight('');
    setCollectModalOpen(true);
  };

  const processCollection = async () => {
    if (!collectedWeight || isNaN(Number(collectedWeight)) || Number(collectedWeight) <= 0) {
      alert('Please enter a valid weight');
      return;
    }

    setLocating(true);
    
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const token = localStorage.getItem('token') || localStorage.getItem('authToken');
          const res = await axios.post(`${API_URL}/complete-pickup`, {
            pickupId: activePickupId,
            collected_weight: Number(collectedWeight),
            lat: latitude,
            lng: longitude
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });

          setRequests(requests.map(r => r._id === activePickupId ? { 
            ...r, 
            status: 'completed', 
            collectedWeightKg: Number(collectedWeight),
            collectedAmount: res.data.amount
          } : r));
          
          alert(`Success! Amount calculated: ₹${res.data.amount} (@ ₹${res.data.price_per_kg}/kg)`);
          setCollectModalOpen(false);
        } catch (err: any) {
          alert(err.response?.data?.message || 'Failed to process collection');
        } finally {
          setLocating(false);
        }
      },
      () => {
        alert('Could not get GPS location. Please allow location access.');
        setLocating(false);
      }
    );
  };

  const completedRequests = requests.filter(r => r.status === 'completed');
  const totalEarnings = completedRequests.reduce((sum, r) => sum + (r.collectedAmount || 0), 0);
  const totalScrap = completedRequests.reduce((sum, r) => sum + (r.collectedWeightKg || 0), 0);
  
  const [filter, setFilter] = useState<'pending' | 'accepted' | 'completed'>('pending');
  const filteredRequests = requests.filter(r => 
    filter === 'pending' ? r.status === 'approved' : r.status === filter
  );

  if (loading) return <div className="p-8 text-center text-slate-500 font-sans">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto pt-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-8">Agent Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
              <FiCheck />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Completed Pickups</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{completedRequests.length}</h3>
            </div>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl shrink-0">
              <FiBox />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Scrap Collected</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">{totalScrap.toFixed(1)} <span className="text-lg text-slate-400 font-semibold">kg</span></h3>
            </div>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shrink-0">
              <FiDollarSign />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Total Earnings</p>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight"><span className="text-lg text-slate-400 font-semibold mr-1">₹</span>{totalEarnings.toFixed(2)}</h3>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-8">
          {(['pending', 'accepted', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                filter === f 
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-200 pointer-events-none' 
                  : 'bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)} ({requests.filter(r => f === 'pending' ? r.status === 'approved' : r.status === f).length})
            </button>
          ))}
        </div>

        {/* Error */}
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-6 font-medium border border-red-100">{error}</div>}

        {/* Requests List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredRequests.length === 0 ? (
              <div className="col-span-full py-16 text-center text-slate-500 bg-transparent rounded-3xl border-2 border-slate-200 border-dashed font-medium">
                No {filter} requests found.
              </div>
            ) : (
              filteredRequests.map((req) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  key={req._id}
                  className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group flex flex-col"
                >
                  <div className="flex justify-between items-start mb-5">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'accepted' ? 'bg-blue-100 text-blue-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {req.status === 'approved' ? 'PENDING' : req.status}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-widest bg-slate-100/80 px-2.5 py-1 rounded-md">
                      {req.scrapType}
                    </span>
                  </div>
                  
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                        <FiUser />
                      </div>
                      <div>
                        <p className="text-[15px] font-bold text-slate-800 tracking-tight leading-tight">{req.user?.name || 'Anonymous User'}</p>
                        <p className="text-xs text-slate-500 font-medium">{req.user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                        <FiMapPin />
                      </div>
                      <p className="text-sm text-slate-600 leading-snug font-medium max-h-16 overflow-hidden line-clamp-2 pt-1">{req.address}</p>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                        <FiBox />
                      </div>
                      <p className="text-sm font-semibold text-slate-600 pt-1.5"><span className="text-slate-400 text-xs font-medium mr-1">EST.</span>{req.estimatedWeightKg} kg</p>
                    </div>
                  </div>

                  {req.status === 'approved' && (
                    <button
                      onClick={() => handleAccept(req._id)}
                      className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-bold transition-all shadow-md active:scale-95"
                    >
                      Accept Return
                    </button>
                  )}

                  {req.status === 'accepted' && (
                    <button
                      onClick={() => openCollectModal(req._id)}
                      className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                    >
                      <FiCheck size={18} strokeWidth={3} /> Mark as Collected
                    </button>
                  )}

                  {req.status === 'completed' && (
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Final Load</p>
                        <span className="text-lg font-black text-slate-800">{req.collectedWeightKg} <span className="text-xs text-slate-500 font-semibold">kg</span></span>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-emerald-500/80 mb-0.5">Calculated</p>
                        <span className="text-lg font-black text-emerald-600">₹{req.collectedAmount}</span>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collection Modal Popup */}
      <AnimatePresence>
        {collectModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mb-6 mx-auto">
                <FiBox />
              </div>
              
              <h2 className="text-2xl font-black text-slate-800 mb-2 text-center">Confirm Weight</h2>
              <p className="text-sm text-slate-500 mb-8 text-center leading-relaxed">Please weigh the collected scrap and enter the exact weight in kilograms below.</p>
              
              <div className="mb-8">
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={collectedWeight}
                    onChange={(e) => setCollectedWeight(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500 transition-colors font-black text-3xl text-slate-800 text-center tracking-tight"
                    placeholder="0.0"
                    step="0.1"
                  />
                  <span className="absolute right-6 text-slate-400 font-bold text-lg">kg</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={processCollection}
                  disabled={locating || !collectedWeight}
                  className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-95 text-[15px]"
                >
                  {locating ? <FiClock className="animate-spin" size={18} /> : <FiMapPin size={18} />}
                  {locating ? 'Capturing Location...' : 'Calculate & Collect'}
                </button>
                <button
                  onClick={() => setCollectModalOpen(false)}
                  className="w-full py-3.5 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors text-[15px]"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
