import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { admin, login } = useAdmin();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (admin) return <Navigate to="/admin/dashboard" replace />;

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-white mb-1">
            THUGX <span className="text-secondary">Admin</span>
          </h1>
          <p className="text-gray-400 text-sm">Sign in to manage your store</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input
              {...register('email', { required: 'Email is required' })}
              type="email"
              className="input-field"
              placeholder="admin@thugxlifestyle.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <input
              {...register('password', { required: 'Password is required' })}
              type="password"
              className="input-field"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
