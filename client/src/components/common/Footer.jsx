import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import api from '../../utils/api';

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/api/settings').then((r) => {
      setCategories(r.data.categories || []);
    }).catch(() => {
      setCategories([{ slug: 'watches', label: 'Watches' }, { slug: 'sunglasses', label: 'Sunglasses' }]);
    });
  }, []);
  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="inline-block">
              <span className="font-heading text-2xl font-bold text-white">
                THUGX
              </span>
              <span className="text-secondary text-xs tracking-[0.3em] uppercase ml-2">
                Lifestyle
              </span>
            </Link>
            <p className="mt-4 text-gray-400 text-sm leading-relaxed">
              Elevate your style with our curated collection of premium watches
              and sunglasses. Crafted for those who demand excellence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-secondary">
              Quick Links
            </h4>
            <ul className="space-y-2">
              <li>
                <Link to="/shop" className="text-gray-400 hover:text-secondary transition-colors text-sm">
                  Shop All
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link to={`/shop/${cat.slug}`} className="text-gray-400 hover:text-secondary transition-colors text-sm">
                    {cat.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/account" className="text-gray-400 hover:text-secondary transition-colors text-sm">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-secondary">
              Customer Service
            </h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400 text-sm">Shipping & Delivery</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Return Policy</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">FAQs</span>
              </li>
              <li>
                <span className="text-gray-400 text-sm">Size Guide</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold mb-4 text-secondary">
              Contact Us
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2">
                <HiOutlineMail className="w-4 h-4 text-secondary" />
                <span className="text-gray-400 text-sm">info@thugxlifestyle.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <HiOutlinePhone className="w-4 h-4 text-secondary" />
                <span className="text-gray-400 text-sm">+234 800 000 0000</span>
              </li>
              <li className="flex items-start space-x-2">
                <HiOutlineLocationMarker className="w-4 h-4 text-secondary mt-0.5" />
                <span className="text-gray-400 text-sm">Lagos, Nigeria</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Thugx Lifestyle. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="text-gray-500 text-sm">Privacy Policy</span>
            <span className="text-gray-500 text-sm">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
