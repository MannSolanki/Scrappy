import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Lock, Recycle, Eye, EyeOff, ShoppingBag, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
    const [searchParams] = useSearchParams();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<'buyer' | 'seller'>(
        (searchParams.get('role') as 'buyer' | 'seller') || 'buyer'
    );
    const [showPass, setShowPass] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsLoading(true);
        try {
            await register(name, email, password, role);
            toast.success(`Account created! Welcome to Scrappy 🌿`);
            navigate(role === 'seller' ? '/seller/dashboard' : '/buyer/dashboard');
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center py-12 px-4">
            <div className="w-full max-w-md animate-fade-in">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg shadow-green-200">
                            <Recycle className="h-7 w-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
                        <p className="text-gray-500 text-sm mt-1">Join thousands of eco-warriors</p>
                    </div>

                    {/* Role selector */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <button
                            type="button"
                            onClick={() => setRole('buyer')}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${role === 'buyer'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <ShoppingBag className={`h-6 w-6 mb-2 ${role === 'buyer' ? 'text-green-600' : 'text-gray-400'}`} />
                            <div className={`font-bold text-sm ${role === 'buyer' ? 'text-green-700' : 'text-gray-600'}`}>Buyer</div>
                            <div className="text-xs text-gray-400 mt-0.5">Browse & purchase scrap</div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole('seller')}
                            className={`p-4 rounded-2xl border-2 transition-all duration-200 text-left ${role === 'seller'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <Package className={`h-6 w-6 mb-2 ${role === 'seller' ? 'text-green-600' : 'text-gray-400'}`} />
                            <div className={`font-bold text-sm ${role === 'seller' ? 'text-green-700' : 'text-gray-600'}`}>Seller</div>
                            <div className="text-xs text-gray-400 mt-0.5">List & sell your scrap</div>
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="input-label">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    className="input-field pl-10"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="input-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type="email"
                                    required
                                    className="input-field pl-10"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="input-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                <input
                                    type={showPass ? 'text' : 'password'}
                                    required
                                    minLength={6}
                                    className="input-field pl-10 pr-10"
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </button>
                            </div>
                            {/* Password strength */}
                            {password && (
                                <div className="mt-2 flex gap-1">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= i * 3 ? 'bg-green-500' : 'bg-gray-200'}`} />
                                    ))}
                                    <span className="text-xs text-gray-400 ml-1 self-center">
                                        {password.length < 4 ? 'Weak' : password.length < 7 ? 'Fair' : 'Strong'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-xs text-gray-400">
                            By signing up, you agree to our{' '}
                            <a href="#" className="text-green-600 hover:underline">Terms of Service</a> and{' '}
                            <a href="#" className="text-green-600 hover:underline">Privacy Policy</a>.
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3.5 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2 justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Creating account...
                                </span>
                            ) : `Create ${role.charAt(0).toUpperCase() + role.slice(1)} Account`}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Already have an account?{' '}
                            <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
