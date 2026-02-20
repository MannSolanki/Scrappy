import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Eye, Package, TrendingUp, DollarSign, Loader2, X, Upload, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Metal', 'E-Waste', 'Plastic', 'Paper', 'Glass', 'Rubber', 'Wood', 'Other'];
const CONDITIONS = ['New', 'Good', 'Fair', 'Poor'];
const PRICE_UNITS = [
    { value: 'per_kg', label: 'Per Kg' },
    { value: 'per_piece', label: 'Per Piece' },
    { value: 'total', label: 'Total Price' },
];

interface ScrapItem {
    _id: string;
    title: string;
    category: string;
    weight: number;
    price: number;
    status: string;
    views: number;
    images?: string[];
    location: string;
    description: string;
    priceUnit: string;
    condition: string;
}

const emptyForm = {
    title: '', description: '', category: 'Metal', weight: '', price: '',
    priceUnit: 'per_kg', location: '', condition: 'Fair',
};

const SellerDashboard = () => {
    const { user } = useAuth();
    const [listings, setListings] = useState<ScrapItem[]>([]);
    const [stats, setStats] = useState({ totalListings: 0, activeListings: 0, soldListings: 0, totalViews: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<ScrapItem | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [priceSuggestion, setPriceSuggestion] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const { data } = await API.get('/api/scraps/my/listings');
            setListings(data.data);
            setStats(data.stats);
        } catch { toast.error('Failed to load listings'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchData(); }, []);

    const fetchPriceSuggestion = async (category: string, weight: string) => {
        if (!category || !weight || Number(weight) <= 0) return;
        try {
            const { data } = await API.get(`/api/scraps/price-suggest?category=${category}&weight=${weight}`);
            if (data.success) setPriceSuggestion(data.data);
        } catch { }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
        if (name === 'category' || name === 'weight') {
            const cat = name === 'category' ? value : form.category;
            const wt = name === 'weight' ? value : form.weight;
            fetchPriceSuggestion(cat, wt);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + images.length > 5) { toast.error('Max 5 images'); return; }
        setImages(prev => [...prev, ...files]);
        setImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
    };

    const removeImage = (i: number) => {
        setImages(prev => prev.filter((_, idx) => idx !== i));
        setImagePreviews(prev => prev.filter((_, idx) => idx !== i));
    };

    const openAdd = () => {
        setEditItem(null);
        setForm(emptyForm);
        setImages([]);
        setImagePreviews([]);
        setPriceSuggestion(null);
        setShowModal(true);
    };

    const openEdit = (item: ScrapItem) => {
        setEditItem(item);
        setForm({
            title: item.title, description: item.description, category: item.category,
            weight: String(item.weight), price: String(item.price),
            priceUnit: item.priceUnit, location: item.location, condition: item.condition,
        });
        setImages([]);
        setImagePreviews(item.images || []);
        setPriceSuggestion(null);
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(form).forEach(([k, v]) => formData.append(k, String(v)));
            images.forEach(img => formData.append('images', img));

            if (editItem) {
                await API.put(`/api/scraps/${editItem._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Listing updated!');
            } else {
                await API.post('/api/scraps', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Listing added! 🎉');
            }
            setShowModal(false);
            fetchData();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Failed to save listing');
        } finally { setSubmitting(false); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this listing?')) return;
        try {
            await API.delete(`/api/scraps/${id}`);
            toast.success('Listing deleted');
            setListings(prev => prev.filter(l => l._id !== id));
        } catch { toast.error('Failed to delete'); }
    };

    const handleStatusToggle = async (item: ScrapItem) => {
        const newStatus = item.status === 'available' ? 'sold' : 'available';
        try {
            await API.put(`/api/scraps/${item._id}`, { status: newStatus });
            setListings(prev => prev.map(l => l._id === item._id ? { ...l, status: newStatus } : l));
            toast.success(`Marked as ${newStatus}`);
        } catch { toast.error('Failed to update status'); }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Seller Dashboard</h1>
                        <p className="text-gray-500 mt-1">Welcome back, <span className="text-green-600 font-semibold">{user?.name}</span> 👋</p>
                    </div>
                    <button onClick={openAdd} className="btn-primary">
                        <Plus className="h-5 w-5 mr-2" /> Add Listing
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Listings', value: stats.totalListings, icon: Package, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Active', value: stats.activeListings, icon: TrendingUp, color: 'bg-green-50 text-green-600' },
                        { label: 'Sold', value: stats.soldListings, icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
                        { label: 'Total Views', value: stats.totalViews, icon: Eye, color: 'bg-purple-50 text-purple-600' },
                    ].map(s => (
                        <div key={s.label} className="card p-5">
                            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center mb-3`}>
                                <s.icon className="h-5 w-5" />
                            </div>
                            <div className="text-2xl font-black text-gray-900">{s.value}</div>
                            <div className="text-sm text-gray-500 mt-0.5">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* Listings table */}
                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">My Listings</h2>
                    </div>
                    {isLoading ? (
                        <div className="p-12 text-center">
                            <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto" />
                        </div>
                    ) : listings.length === 0 ? (
                        <div className="p-12 text-center">
                            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 font-medium">No listings yet</p>
                            <p className="text-gray-400 text-sm mt-1">Click "Add Listing" to get started</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 text-left">
                                    <tr>
                                        {['Item', 'Category', 'Weight', 'Price', 'Status', 'Views', 'Actions'].map(h => (
                                            <th key={h} className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {listings.map(item => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                                        {item.images?.[0] ? (
                                                            <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-lg">♻️</div>
                                                        )}
                                                    </div>
                                                    <span className="font-medium text-gray-900 truncate max-w-[150px]">{item.title}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="category-badge bg-gray-100 text-gray-700">{item.category}</span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">{item.weight} kg</td>
                                            <td className="px-6 py-4 font-bold text-green-600">₹{item.price}</td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => handleStatusToggle(item)}
                                                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${item.status === 'available'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                                                        }`}
                                                >
                                                    {item.status}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">{item.views}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="h-4 w-4" /></button>
                                                    <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="h-4 w-4" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">{editItem ? 'Edit Listing' : 'Add New Listing'}</h2>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            {/* Title */}
                            <div>
                                <label className="input-label">Item Title *</label>
                                <input name="title" required className="input-field" placeholder="e.g. Old iron pipes" value={form.title} onChange={handleFormChange} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Category */}
                                <div>
                                    <label className="input-label">Category *</label>
                                    <select name="category" required className="input-field" value={form.category} onChange={handleFormChange}>
                                        {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                                {/* Condition */}
                                <div>
                                    <label className="input-label">Condition</label>
                                    <select name="condition" className="input-field" value={form.condition} onChange={handleFormChange}>
                                        {CONDITIONS.map(c => <option key={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {/* Weight */}
                                <div>
                                    <label className="input-label">Weight (kg) *</label>
                                    <input name="weight" type="number" min="0.1" step="0.1" required className="input-field" placeholder="0.0" value={form.weight} onChange={handleFormChange} />
                                </div>
                                {/* Price */}
                                <div>
                                    <label className="input-label">Price (₹) *</label>
                                    <input name="price" type="number" min="0" required className="input-field" placeholder="0" value={form.price} onChange={handleFormChange} />
                                </div>
                                {/* Price unit */}
                                <div>
                                    <label className="input-label">Price Unit</label>
                                    <select name="priceUnit" className="input-field" value={form.priceUnit} onChange={handleFormChange}>
                                        {PRICE_UNITS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Price Suggestion */}
                            {priceSuggestion && (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-bold text-green-700">AI Price Suggestion</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div>
                                            <div className="text-lg font-black text-green-700">₹{priceSuggestion.suggestedMin}</div>
                                            <div className="text-xs text-green-600">Min</div>
                                        </div>
                                        <div className="border-x border-green-200">
                                            <div className="text-lg font-black text-green-800">₹{priceSuggestion.suggested}</div>
                                            <div className="text-xs text-green-600">Suggested</div>
                                        </div>
                                        <div>
                                            <div className="text-lg font-black text-green-700">₹{priceSuggestion.suggestedMax}</div>
                                            <div className="text-xs text-green-600">Max</div>
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setForm(f => ({ ...f, price: String(priceSuggestion.suggested) }))} className="mt-3 text-xs text-green-600 font-semibold hover:underline">
                                        Use suggested price ₹{priceSuggestion.suggested}
                                    </button>
                                </div>
                            )}

                            {/* Location */}
                            <div>
                                <label className="input-label">Pickup Location *</label>
                                <input name="location" required className="input-field" placeholder="e.g. Surat, Gujarat" value={form.location} onChange={handleFormChange} />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="input-label">Description *</label>
                                <textarea name="description" required rows={3} className="input-field resize-none" placeholder="Describe the scrap item..." value={form.description} onChange={handleFormChange} />
                            </div>

                            {/* Images */}
                            <div>
                                <label className="input-label">Photos (Max 5)</label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all"
                                >
                                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload images</p>
                                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 5MB</p>
                                    <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={handleImageChange} />
                                </div>
                                {imagePreviews.length > 0 && (
                                    <div className="flex gap-2 mt-3 flex-wrap">
                                        {imagePreviews.map((src, i) => (
                                            <div key={i} className="relative group">
                                                <img src={src} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                                                <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancel</button>
                                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
                                    {submitting ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Saving...</> : editItem ? 'Update Listing' : 'Add Listing'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboard;
