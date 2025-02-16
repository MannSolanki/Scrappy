import React from 'react';
import { Link } from 'react-router-dom';
import { Recycle } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Recycle className="h-8 w-8" />
            <span className="text-xl font-bold">EcoScrap</span>
          </Link>
          <div className="flex space-x-6">
            <Link to="/" className="hover:text-green-200 transition-colors">Home</Link>
            <Link to="/about" className="hover:text-green-200 transition-colors">About</Link>
            <Link to="/contact" className="hover:text-green-200 transition-colors">Contact</Link>
            <Link to="/login" className="bg-white text-green-600 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;