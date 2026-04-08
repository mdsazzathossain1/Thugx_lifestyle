import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { HiOutlineViewGrid, HiOutlineCollection, HiOutlineClipboardList, HiOutlineTicket, HiOutlineCog, HiOutlineLogout } from 'react-icons/hi';
import LoadingSpinner from '../common/LoadingSpinner';

const AdminLayout = () => {
  const { admin, loading, logout } = useAdmin();
  const location = useLocation();

  if (loading) return <LoadingSpinner fullScreen />;
  if (!admin) return <Navigate to="/admin/login" replace />;

  const navItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
    { path: '/admin/products', label: 'Products', icon: HiOutlineCollection },
    { path: '/admin/finances', label: 'Finances', icon: HiOutlineClipboardList },
    { path: '/admin/orders', label: 'Orders', icon: HiOutlineClipboardList },
    { path: '/admin/coupons', label: 'Coupons', icon: HiOutlineTicket },
    { path: '/admin/settings', label: 'Settings', icon: HiOutlineCog },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="flex min-h-screen bg-light">
      {/* Sidebar */}
      <aside className="w-64 bg-primary text-white flex-shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/admin/dashboard" className="block">
            <span className="font-heading text-xl font-bold">THUGX</span>
            <span className="text-secondary text-xs tracking-[0.2em] ml-2">ADMIN</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-md transition-colors ${
                isActive(path)
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="px-4 py-2 mb-2">
            <p className="text-sm text-gray-400">Logged in as</p>
            <p className="text-sm font-medium">{admin.username}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center space-x-3 px-4 py-3 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 transition-colors w-full"
          >
            <HiOutlineLogout className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-primary text-white z-50 px-4 py-3 flex items-center justify-between">
        <Link to="/admin/dashboard" className="font-heading text-lg font-bold">
          THUGX <span className="text-secondary text-xs">ADMIN</span>
        </Link>
        <div className="flex items-center space-x-4">
          {navItems.map(({ path, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`p-2 rounded ${isActive(path) ? 'text-secondary' : 'text-gray-400'}`}
            >
              <Icon className="w-5 h-5" />
            </Link>
          ))}
          <button onClick={logout} className="p-2 text-gray-400 hover:text-white">
            <HiOutlineLogout className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 mt-14 md:mt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
