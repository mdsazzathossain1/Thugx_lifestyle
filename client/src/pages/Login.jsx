import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { HiCheckCircle } from 'react-icons/hi';
import { BACKEND_URL } from '../utils/api';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      navigate(redirect);
    } catch (error) {
      const errorData = error.response?.data;
      
      // Handle email not verified
      if (error.response?.status === 403 && errorData?.requiresVerification) {
        setUnverifiedEmail(errorData.email);
        toast.error('Please verify your email before logging in');
      } else {
        toast.error(errorData?.message || 'Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!unverifiedEmail) return;

    setResendLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail, type: 'registration' }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message || 'Verification code sent! Check your inbox.');
      } else {
        toast.error(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setResendLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!unverifiedEmail) return;
    if (!otp.trim()) return toast.error('Enter the verification code');
    setVerifyLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: unverifiedEmail, type: 'registration', otp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Email verified successfully');
        setUnverifiedEmail(null);
      } else {
        toast.error(data.message || 'Invalid or expired code');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error('Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="section-padding">
      <div className="container-custom max-w-md">
        <div className="text-center mb-8">
          <h1 className="heading-lg mb-2">Welcome Back</h1>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        {unverifiedEmail ? (
          // Email Verification Required Message
          <div className="bg-white border border-border rounded-lg p-8 space-y-5">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">✉️</div>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Email Verification Required</h2>
              <p className="text-gray-600">
                Your account has been created, but you need to verify your email before you can log in.
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 text-left rounded">
                <p className="text-sm text-blue-900">
                  <strong>Email:</strong> {unverifiedEmail}
                </p>
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-left">
                <p className="text-sm text-blue-900"><strong>Email:</strong> {unverifiedEmail}</p>
                <p className="mt-2 text-gray-600">We've sent a 6-digit verification code to your email. Enter it below to verify your account.</p>
                <p className="text-xs text-gray-500">Check your spam folder if you don't see it.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Verification Code</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input-field text-center tracking-widest"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>

                <button type="submit" disabled={verifyLoading} className="btn-primary w-full">
                  {verifyLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  type="button"
                  onClick={handleResendVerification}
                  disabled={resendLoading}
                  className="w-full mt-2 border border-gray-200 rounded-lg py-2 text-sm"
                >
                  {resendLoading ? 'Resending...' : 'Resend Code'}
                </button>

                <button
                  onClick={() => setUnverifiedEmail(null)}
                  className="w-full border-2 border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50 transition-colors duration-300"
                >
                  Back to Login
                </button>
              </form>
            </div>
          </div>
        ) : (
          // Login Form
          <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-lg p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input {...register('email')} type="email" className="input-field" placeholder="email@example.com" />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
              <input {...register('password')} type="password" className="input-field" placeholder="Enter your password" />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div className="text-right">
              <Link to="/forgot-password" className="text-secondary font-medium hover:underline text-sm">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to={`/register${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-secondary font-medium hover:underline">
                Create one
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
