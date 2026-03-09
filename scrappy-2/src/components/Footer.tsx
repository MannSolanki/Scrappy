import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">EcoScrap</h3>
            <p className="text-gray-300">
              Making the world cleaner through responsible recycling and scrap management.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 cursor-pointer transition-all duration-300 hover:text-green-400 hover:underline"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 cursor-pointer transition-all duration-300 hover:text-green-400 hover:underline"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="text-gray-300 cursor-pointer transition-all duration-300 hover:text-green-400 hover:underline"
                >
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Info</h3>
            <div className="space-y-2 text-gray-300">
              <p className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +1 (555) 123-4567
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> info@ecoscrap.com
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> 123 Recycling Way, Green City
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} EcoScrap. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
