import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineShoppingBag, HiOutlineUser, HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/api/settings').then((r) => {
      setCategories(r.data.categories || []);
    }).catch(() => {
      setCategories([{ slug: 'watches', label: 'Watches' }, { slug: 'sunglasses', label: 'Sunglasses' }]);
    });
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm z-50 border-b border-border">
      <div className="container-custom">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-heading text-2xl md:text-3xl font-bold text-primary tracking-tight">
              THUGX
            </span>
            <span className="text-secondary text-xs md:text-sm font-body tracking-[0.3em] uppercase">
              Lifestyle
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-dark hover:text-secondary transition-colors font-medium text-sm tracking-wide uppercase">
              Shop
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/shop/${cat.slug}`}
                className="text-dark hover:text-secondary transition-colors font-medium text-sm tracking-wide uppercase"
              >
                {cat.label}
              </Link>
            ))}
          </div>

          {/* Right side icons */}
          <div className="flex items-center space-x-4">
            {/* User */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-1 text-dark hover:text-secondary transition-colors">
                    <HiOutlineUser className="w-5 h-5" />
                    <span className="text-sm">{user.name?.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <Link to="/account" className="block px-4 py-2 text-sm text-dark hover:bg-light transition-colors">
                      My Account
                    </Link>
                    <Link to="/account/orders" className="block px-4 py-2 text-sm text-dark hover:bg-light transition-colors">
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-dark hover:bg-light transition-colors border-t border-border">
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <Link to="/login" className="text-dark hover:text-secondary transition-colors">
                  <HiOutlineUser className="w-5 h-5" />
                </Link>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="relative text-dark hover:text-secondary transition-colors">
              <HiOutlineShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-secondary text-primary text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-dark hover:text-secondary transition-colors"
            >
              {isOpen ? <HiOutlineX className="w-6 h-6" /> : <HiOutlineMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 animation-fade-in">
            <div className="flex flex-col space-y-3">
              <Link to="/shop" onClick={() => setIsOpen(false)} className="text-dark hover:text-secondary transition-colors font-medium text-sm tracking-wide uppercase py-2">
                Shop All
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop/${cat.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="text-dark hover:text-secondary transition-colors font-medium text-sm tracking-wide uppercase py-2"
                >
                  {cat.label}
                </Link>
              ))}
              <div className="border-t border-border pt-3">
                {user ? (
                  <>
                    <Link to="/account" onClick={() => setIsOpen(false)} className="block text-dark hover:text-secondary transition-colors font-medium text-sm py-2">
                      My Account
                    </Link>
                    <Link to="/account/orders" onClick={() => setIsOpen(false)} className="block text-dark hover:text-secondary transition-colors font-medium text-sm py-2">
                      My Orders
                    </Link>
                    <button onClick={handleLogout} className="block text-dark hover:text-secondary transition-colors font-medium text-sm py-2">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block text-dark hover:text-secondary transition-colors font-medium text-sm py-2">
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setIsOpen(false)} className="block text-dark hover:text-secondary transition-colors font-medium text-sm py-2">
                      Register
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
