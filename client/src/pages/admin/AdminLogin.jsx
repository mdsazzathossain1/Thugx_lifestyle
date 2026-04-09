import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAdmin } from '../../context/AdminContext';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { admin, login } = useAdmin();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  if (admin) return <Navigate to="/admin/dashboard" replace />;

  const onSubmit = async (data) => {
    setSubmitting(true);
    setErrorMessage(''); // Clear previous errors
    console.log('🔐 Admin login attempt:', data.email);
    
    try {
      console.log('📤 Sending login request...');
      await login(data.email, data.password);
      console.log('✅ Login successful!');
      toast.success('Welcome, Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('❌ Login error caught:');
      console.error('Error object:', error);
      console.error('Response:', error.response);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      const errorMsg = error.response?.data?.message || error.message || 'Login failed';
      setErrorMessage(errorMsg);
      console.log('Error message to display:', errorMsg);
      toast.error(errorMsg);
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
          {/* Error Banner */}
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-700 text-sm"><strong>Error:</strong> {errorMessage}</p>
            </div>
          )}

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

        {/* Debug Info (Remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 bg-gray-900 text-gray-300 text-xs p-3 rounded overflow-auto max-h-24">
            <p className="text-gray-400 mb-1">Debug Info:</p>
            <p>Status: {submitting ? 'Submitting...' : 'Ready'}</p>
            {errorMessage && <p className="text-red-400">Last Error: {errorMessage}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
