import { createContext, useContext, useState, useEffect } from 'react';
import { adminApi } from '../utils/api';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const savedAdmin = localStorage.getItem('admin');
    if (token && savedAdmin) {
      try {
        setAdmin(JSON.parse(savedAdmin));
      } catch {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await adminApi.post('/admin/login', { email, password });
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('admin', JSON.stringify(data));
    setAdmin(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdmin(null);
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
