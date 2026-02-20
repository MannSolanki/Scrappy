import React from 'react';
import { MapPin, Weight, Eye, Tag } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
    Metal: 'bg-blue-100 text-blue-700',
    'E-Waste': 'bg-purple-100 text-purple-700',
    Plastic: 'bg-yellow-100 text-yellow-700',
    Paper: 'bg-orange-100 text-orange-700',
    Glass: 'bg-cyan-100 text-cyan-700',
    Rubber: 'bg-red-100 text-red-700',
    Wood: 'bg-amber-100 text-amber-700',
    Other: 'bg-gray-100 text-gray-700',
};

const CATEGORY_EMOJI: Record<string, string> = {
    Metal: '🔩', 'E-Waste': '💻', Plastic: '♻️', Paper: '📄',
    Glass: '🫙', Rubber: '⚙️', Wood: '🌲', Other: '📦',
};

interface ListingCardProps {
    item: {
        _id: string;
        title: string;
        description: string;
        category: string;
        weight: number;
        price: number;
        priceUnit?: string;
        images?: string[];
        location: string;
        status: string;
        views?: number;
        seller?: { name: string };
    };
    onContact?: () => void;
}

const ListingCard = ({ item, onContact }: ListingCardProps) => {
    const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
    const categoryEmoji = CATEGORY_EMOJI[item.category] || '📦';
    const unitLabel = item.priceUnit === 'per_piece' ? 'ea' : item.priceUnit === 'total' ? 'total' : '/kg';

    return (
        <div className="card card-hover overflow-hidden group relative">
            {/* Status badge */}
            {item.status !== 'available' && (
                <div className="absolute top-3 right-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full capitalize">
                    {item.status}
                </div>
            )}

            {/* Image */}
            <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative">
                {item.images?.[0] ? (
                    <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-7xl">{categoryEmoji}</span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <span className={`category-badge ${categoryColor} text-xs`}>
                        {item.category}
                    </span>
                    {item.views !== undefined && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                            <Eye className="h-3 w-3" /> {item.views}
                        </span>
                    )}
                </div>

                <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{item.title}</h3>
                <p className="text-gray-500 text-sm mb-4 line-clamp-2 leading-relaxed">{item.description}</p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                        <Weight className="h-3 w-3" /> {item.weight} kg
                    </span>
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {item.location}
                    </span>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-black text-green-600">₹{item.price}</span>
                        <span className="text-sm text-gray-400 ml-1">{unitLabel}</span>
                    </div>
                    {item.seller && (
                        <span className="text-xs text-gray-400">by {item.seller.name}</span>
                    )}
                </div>

                {onContact && (
                    <button
                        onClick={onContact}
                        className="btn-primary w-full mt-4 py-2.5 text-sm"
                    >
                        Contact Seller
                    </button>
                )}
            </div>
        </div>
    );
};

export default ListingCard;
