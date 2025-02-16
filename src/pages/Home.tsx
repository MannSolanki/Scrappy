import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div>
      <div className="relative h-[600px]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b"
            alt="Recycling facility"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="text-white max-w-2xl">
            <h1 className="text-5xl font-bold mb-6">Transform Waste into Wealth</h1>
            <p className="text-xl mb-8">Connect, Sell, and Sustain! A Web Application for Eco-Friendly🌱Transactions.</p>
            <Link to="/login" className="inline-flex items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors">
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Metal Recycling</h3>
              <p className="text-gray-600">We handle all types of metal recycling with competitive prices and efficient processing.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">E-Waste Management</h3>
              <p className="text-gray-600">Responsible disposal and recycling of electronic waste with data security guaranteed.</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Industrial Scrap</h3>
              <p className="text-gray-600">Comprehensive solutions for industrial scrap collection and processing.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;