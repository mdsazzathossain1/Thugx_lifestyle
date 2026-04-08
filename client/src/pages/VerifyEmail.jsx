import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import { BACKEND_URL } from '../utils/api';
import toast from 'react-hot-toast';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error, expired
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const token = searchParams.get('token');
        const emailParam = searchParams.get('email');

        if (!token || !emailParam) {
          setStatus('error');
          setMessage('Invalid verification link or code. Missing token or email.');
          return;
        }

        setEmail(emailParam);

        // Send verification request
        const response = await fetch(`${BACKEND_URL}/api/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            token,
            email: emailParam,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully!');
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (response.status === 400 && data.message.includes('expired')) {
          setStatus('expired');
          setMessage(data.message || 'Verification token or code has expired.');
          setEmail(emailParam);
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification failed. If you received a code, use the Verify Code box on the login or registration screen.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('An error occurred during verification. Please try again later.');
      }
    };

    verifyToken();
  }, [searchParams, navigate]);

  const handleResendVerification = async () => {
    if (!email) {
      toast.error('Email not found');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Use OTP-based resend
        toast.success(data.message || 'Verification code sent! Check your inbox.');
      } else {
        toast.error(data.message || 'Failed to resend verification code');
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white">
            <div className="flex justify-center mb-4">
              {status === 'loading' && <div className="w-16 h-16 animate-spin border-4 border-white border-t-transparent rounded-full" />}
              {status === 'success' && <HiCheckCircle className="w-16 h-16" />}
              {(status === 'error' || status === 'expired') && <HiExclamationCircle className="w-16 h-16" />}
            </div>
            <h1 className="text-3xl font-bold">Email Verification</h1>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Loading State */}
            {status === 'loading' && (
              <div className="text-center space-y-4">
                <p className="text-gray-600">Verifying your email...</p>
                <p className="text-sm text-gray-600">Please wait while we confirm your email address. If your app uses one-time codes (OTP), enter the code on the login/registration screens instead.</p>
              </div>
            )}

            {/* Success State */}
            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold">✅ {message}</p>
                </div>
                <p className="text-gray-600">You will be redirected to login in a few seconds.</p>
                <Link
                  to="/login"
                  className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow duration-300"
                >
                  Go to Login
                </Link>
              </div>
            )}

            {/* Error State */}
            {status === 'error' && (
              <div className="text-center space-y-4">
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-semibold">❌ {message}</p>
                </div>
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow duration-300"
                  >
                    Back to Login
                  </Link>
                  {email && (
                    <button
                      onClick={handleResendVerification}
                      disabled={loading}
                      className="w-full border-2 border-purple-600 text-purple-600 font-bold py-3 rounded-lg hover:bg-purple-50 transition-colors duration-300 disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Resend Verification Code'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Expired State */}
            {status === 'expired' && (
              <div className="text-center space-y-4">
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800 font-semibold">⏰ {message}</p>
                </div>
                <p className="text-gray-600">Don't worry! We can send you a new verification code.</p>
                <div className="space-y-3">
                  <button
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow duration-300 disabled:opacity-50"
                  >
                    {loading ? 'Sending...' : 'Resend Verification Code'}
                  </button>
                  <Link
                    to="/login"
                    className="inline-block w-full border-2 border-purple-600 text-purple-600 font-bold py-3 rounded-lg hover:bg-purple-50 transition-colors duration-300"
                  >
                    Back to Login
                  </Link>
                </div>
              </div>
            )}

            {/* Help Section */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                <strong>Didn't receive an email?</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Check your spam or junk folder</li>
                <li>• Verify the email address is correct</li>
                <li>• Try resending the verification email</li>
              </ul>
            </div>

            {/* Footer */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>
                Need help?{' '}
                <a href="#" className="text-purple-600 hover:underline font-semibold">
                  Contact Support
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Logo/Brand - Optional */}
        <p className="text-center text-white mt-6 text-sm">
          © 2026 Thugx Lifestyle. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
