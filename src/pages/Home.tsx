import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Recycle, TrendingUp, Shield, Zap, Users, Package,
  Leaf, ChevronRight, Star
} from 'lucide-react';
import API from '../api/axios';

const CATEGORIES = [
  { name: 'Metal', emoji: '🔩', color: 'bg-blue-50 border-blue-200 text-blue-700', price: '₹25–60/kg' },
  { name: 'E-Waste', emoji: '💻', color: 'bg-purple-50 border-purple-200 text-purple-700', price: '₹50–150/kg' },
  { name: 'Plastic', emoji: '♻️', color: 'bg-yellow-50 border-yellow-200 text-yellow-700', price: '₹8–25/kg' },
  { name: 'Paper', emoji: '📄', color: 'bg-orange-50 border-orange-200 text-orange-700', price: '₹5–18/kg' },
  { name: 'Glass', emoji: '🫙', color: 'bg-cyan-50 border-cyan-200 text-cyan-700', price: '₹2–10/kg' },
  { name: 'Rubber', emoji: '⚙️', color: 'bg-red-50 border-red-200 text-red-700', price: '₹10–30/kg' },
];

const FEATURES = [
  { icon: TrendingUp, title: 'Smart Pricing', desc: 'AI-powered price suggestions based on market rates and scrap category.', color: 'text-green-600 bg-green-100' },
  { icon: Shield, title: 'Verified Sellers', desc: 'Every seller is vetted. Buy with confidence from trusted recyclers.', color: 'text-blue-600 bg-blue-100' },
  { icon: Zap, title: 'Instant Connect', desc: 'Direct communication between buyers and sellers. No middlemen.', color: 'text-yellow-600 bg-yellow-100' },
  { icon: Leaf, title: 'Eco Impact', desc: 'Track your environmental contribution with every transaction.', color: 'text-emerald-600 bg-emerald-100' },
];

const HOW_IT_WORKS = [
  { step: '01', role: 'Sellers', title: 'List Your Scrap', desc: 'Photos, category, weight — done in 2 minutes.', color: 'from-green-500 to-emerald-600' },
  { step: '02', role: 'Platform', title: 'Get Price Suggestion', desc: 'Our AI engine suggests the best market price instantly.', color: 'from-emerald-500 to-teal-600' },
  { step: '03', role: 'Buyers', title: 'Browse & Buy', desc: 'Search by category, location, price — find what you need.', color: 'from-teal-500 to-cyan-600' },
];

const Home = () => {
  const [stats, setStats] = useState({ totalUsers: 0, totalListings: 0, totalSold: 0 });
  const [listings, setListings] = useState<any[]>([]);

  useEffect(() => {
    // Fetch platform stats
    API.get('/api/users/stats').then(({ data }) => {
      if (data.success) setStats(data.data);
    }).catch(() => { });

    // Fetch featured listings
    API.get('/api/scraps?limit=6&status=available').then(({ data }) => {
      if (data.success) setListings(data.data);
    }).catch(() => { });
  }, []);

  return (
    <div className="overflow-x-hidden">
      {/* ── HERO ─────────────────────────────────── */}
      <section className="hero-gradient relative overflow-hidden min-h-[600px] flex items-center">
        {/* Decorative circles */}
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-3xl animate-slide-up">
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-green-200 text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" /> India's #1 Eco-Friendly Scrap Marketplace
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
              Turn Waste Into <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400">Wealth</span> 🌿
            </h1>
            <p className="text-lg md:text-xl text-green-100 mb-10 leading-relaxed max-w-2xl">
              Connect directly with buyers and sellers of recyclable scrap. Get AI-powered price suggestions. Build a greener tomorrow — one transaction at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/signup" className="btn-primary text-base px-8 py-4 group">
                Start Selling <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/buyer/dashboard" className="inline-flex items-center justify-center px-8 py-4 glass-card text-white font-semibold rounded-xl hover:bg-white/20 transition-all duration-300 text-base">
                Browse Listings
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4">
            <div className="glass-card rounded-t-3xl px-8 py-5 grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Active Listings', value: stats.totalListings || '500+' },
                { label: 'Registered Users', value: stats.totalUsers || '2K+' },
                { label: 'Items Recycled', value: (stats.totalSold || 1200) + '+' },
              ].map((s) => (
                <div key={s.label}>
                  <div className="text-2xl md:text-3xl font-bold text-white">{s.value}</div>
                  <div className="text-green-200 text-xs md:text-sm mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ─────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="section-title">Scrap Categories</h2>
            <p className="section-subtitle">Find competitive prices across all types of recyclable materials</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                to={`/buyer/dashboard?category=${cat.name}`}
                className={`card card-hover p-5 text-center border ${cat.color} group cursor-pointer`}
              >
                <div className="text-4xl mb-3">{cat.emoji}</div>
                <div className="font-bold text-sm mb-1">{cat.name}</div>
                <div className="text-xs opacity-75">{cat.price}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED LISTINGS ─────────────────────── */}
      {listings.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="section-title">Fresh Listings</h2>
                <p className="text-gray-500 mt-2">Recently added scrap items available for purchase</p>
              </div>
              <Link to="/buyer/dashboard" className="hidden md:flex items-center text-green-600 font-semibold hover:text-green-700 gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((item) => (
                <div key={item._id} className="card card-hover overflow-hidden group">
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    {item.images?.[0] ? (
                      <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        {CATEGORIES.find(c => c.name === item.category)?.emoji || '♻️'}
                      </div>
                    )}
                    <span className="absolute top-3 left-3 category-badge bg-white/90 text-gray-700 shadow">{item.category}</span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">{item.title}</h3>
                    <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">₹{item.price}<span className="text-sm text-gray-400 font-normal">/kg</span></span>
                      <span className="text-sm text-gray-500">{item.weight} kg • {item.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HOW IT WORKS ───────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">How Scrappy Works</h2>
            <p className="section-subtitle">Simple, fast, and eco-friendly transactions in 3 steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative text-center group">
                <div className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white text-2xl font-black">{step.step}</span>
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-green-500 mb-2">{step.role}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                <p className="text-gray-500">{step.desc}</p>
                {i < 2 && <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-6rem)] h-0.5 bg-gradient-to-r from-green-200 to-transparent" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="section-title">Why Choose Scrappy?</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 group hover:-translate-y-2 transition-all duration-300">
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section className="py-20 hero-gradient relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute text-white text-4xl" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, opacity: Math.random() * 0.5 }}>♻</div>
          ))}
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Recycle className="h-16 w-16 text-green-300 mx-auto mb-6 animate-spin" style={{ animationDuration: '8s' }} />
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Ready to start recycling?</h2>
          <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto">Join thousands of eco-conscious Indians turning waste into income</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup?role=seller" className="btn-primary text-base px-8 py-4">
              I want to Sell Scrap
            </Link>
            <Link to="/signup?role=buyer" className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-700 font-bold rounded-xl hover:bg-green-50 transition-all duration-300 text-base">
              I want to Buy Scrap
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;