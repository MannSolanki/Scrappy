import React, { useState, useEffect } from 'react';
import { Search, Filter, X, ShoppingBag, Loader2, SlidersHorizontal } from 'lucide-react';
import API from '../api/axios';
import ListingCard from '../components/ListingCard';
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

const CATEGORIES = ['All', 'Metal', 'E-Waste', 'Plastic', 'Paper', 'Glass', 'Rubber', 'Wood', 'Other'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

const BuyerDashboard = () => {
    const [searchParams] = useSearchParams();
    const [listings, setListings] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [sort, setSort] = useState('newest');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [showFilters, setShowFilters] = useState(false);
    const [contactModal, setContactModal] = useState<any>(null);

    const fetchListings = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '9',
                sort,
                status: 'available',
            });
            if (category && category !== 'All') params.append('category', category);
            if (search) params.append('search', search);
            if (minPrice) params.append('minPrice', minPrice);
            if (maxPrice) params.append('maxPrice', maxPrice);

            const { data } = await API.get(`/api/scraps?${params}`);
            setListings(data.data);
            setTotalPages(data.totalPages);
            setTotal(data.total);
        } catch { toast.error('Failed to load listings'); }
        finally { setIsLoading(false); }
    };

    useEffect(() => { fetchListings(); }, [category, sort, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchListings();
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('All');
        setMinPrice('');
        setMaxPrice('');
        setSort('newest');
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900">Browse Scrap Marketplace</h1>
                    <p className="text-gray-500 mt-1">
                        {total > 0 ? `${total} item${total !== 1 ? 's' : ''} available` : 'Find quality recyclable materials'}
                    </p>
                </div>

                {/* Search + filter bar */}
                <div className="card p-4 mb-6">
                    <form onSubmit={handleSearch} className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search scrap items..."
                                className="input-field pl-10"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="btn-primary px-5">Search</button>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`btn-outline px-4 ${showFilters ? 'bg-green-50' : ''}`}
                        >
                            <SlidersHorizontal className="h-5 w-5" />
                        </button>
                    </form>

                    {/* Filter panel */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-4 animate-fade-in">
                            <div>
                                <label className="input-label">Min Price (₹)</label>
                                <input type="number" className="input-field" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Max Price (₹)</label>
                                <input type="number" className="input-field" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
                            </div>
                            <div>
                                <label className="input-label">Sort By</label>
                                <select className="input-field" value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                                    {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <button onClick={() => { clearFilters(); fetchListings(); }} className="btn-outline w-full py-3 text-sm">
                                    <X className="h-4 w-4 mr-1" /> Clear All
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Category pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-thin">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => { setCategory(cat); setPage(1); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 ${category === cat
                                    ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-300 hover:text-green-600'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Listings grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-green-500" />
                    </div>
                ) : listings.length === 0 ? (
                    <div className="text-center py-20">
                        <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-600 mb-2">No listings found</h3>
                        <p className="text-gray-400">Try adjusting your search or filters</p>
                        <button onClick={clearFilters} className="btn-outline mt-4">Clear Filters</button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {listings.map(item => (
                                <ListingCard
                                    key={item._id}
                                    item={item}
                                    onContact={() => setContactModal(item)}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-10">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${p === page ? 'bg-green-600 text-white shadow-sm' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-300'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="btn-outline px-4 py-2 text-sm disabled:opacity-40"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Contact Modal */}
            {contactModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Contact Seller</h2>
                            <button onClick={() => setContactModal(null)} className="p-2 hover:bg-gray-100 rounded-xl">
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 rounded-2xl p-4">
                                <p className="font-bold text-gray-900">{contactModal.title}</p>
                                <p className="text-green-600 font-bold text-lg mt-1">₹{contactModal.price}/kg</p>
                            </div>
                            {contactModal.seller && (
                                <div className="space-y-2 text-sm text-gray-700">
                                    <p><span className="font-semibold">Seller:</span> {contactModal.seller.name}</p>
                                    {contactModal.seller.email && <p><span className="font-semibold">Email:</span> <a href={`mailto:${contactModal.seller.email}`} className="text-green-600 hover:underline">{contactModal.seller.email}</a></p>}
                                    {contactModal.seller.phone && <p><span className="font-semibold">Phone:</span> <a href={`tel:${contactModal.seller.phone}`} className="text-green-600 hover:underline">{contactModal.seller.phone}</a></p>}
                                    <p><span className="font-semibold">Location:</span> {contactModal.location}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={() => setContactModal(null)} className="btn-primary w-full mt-6">Done</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BuyerDashboard;
