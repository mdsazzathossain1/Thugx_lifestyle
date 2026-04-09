import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../utils/api';
import { HiCheckCircle } from 'react-icons/hi';

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters with uppercase, number, and special character')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[@$!%*?&]/, 'Must contain a special character (@$!%*?&)'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { register: registerUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          password: data.password,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setRegisteredEmail(data.email);
        setRegistrationSuccess(true);
        toast.success(result.message || 'Account created! Please verify your email.');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) return toast.error('Please enter the verification code');
    setVerifyLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, type: 'registration', otp }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Email verified successfully');
        navigate('/login');
      } else {
        toast.error(data.message || 'Invalid or expired code');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error('An error occurred while verifying');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setResendLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail, type: 'registration' }),
      });
      if (res.ok) {
        toast.success('Verification code resent. Check your email.');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to resend code');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      toast.error('Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="section-padding">
        <div className="container-custom max-w-md">
          <div className="bg-white border border-border rounded-lg p-8">
            <div className="text-center space-y-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl">✉️</div>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800">Enter Verification Code</h2>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                <p className="text-gray-700">We've sent a 6-digit verification code to:</p>
                <p className="font-semibold text-gray-800 mt-2 break-all">{registeredEmail}</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="w-full mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Verification Code</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="input-field text-center tracking-widest text-lg"
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                </div>

                <button type="submit" disabled={verifyLoading} className="btn-primary w-full">
                  {verifyLoading ? 'Verifying...' : 'Verify Code'}
                </button>

                <button type="button" onClick={handleResendOtp} disabled={resendLoading} className="w-full mt-2 border border-gray-200 rounded-lg py-2 text-sm">
                  {resendLoading ? 'Resending...' : 'Resend Code'}
                </button>
              </form>

              <div className="text-sm text-gray-600 space-y-2">
                <p>💡 <strong>Tip:</strong> Check spam/junk folder if you don't see the code.</p>
                <p>⏰ <strong>Note:</strong> The code expires after a short time for security.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-custom max-w-md">
        <div className="text-center mb-8">
          <h1 className="heading-lg mb-2">Create Account</h1>
          <p className="text-gray-500">Join Thugx Lifestyle</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-border rounded-lg p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
            <input {...register('name')} className="input-field" placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="email@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
            <input {...register('phone')} className="input-field" placeholder="+234..." />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password</label>
            <p className="text-xs text-gray-500 mb-2">Min 8 chars, 1 uppercase, 1 number, 1 special char (@$!%*?&)</p>
            <input {...register('password')} type="password" className="input-field" placeholder="Create a strong password" />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" className="input-field" placeholder="Re-enter your password" />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to={`/login${redirect !== '/' ? `?redirect=${redirect}` : ''}`} className="text-secondary font-medium hover:underline">
              Sign in
            </Link>
          </p>

          <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
            <p className="mb-2"><strong>🔒 Password Requirements:</strong></p>
            <ul className="space-y-1">
              <li>✓ At least 8 characters long</li>
              <li>✓ Contains uppercase letter (A-Z)</li>
              <li>✓ Contains number (0-9)</li>
              <li>✓ Contains special character (@$!%*?&)</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
