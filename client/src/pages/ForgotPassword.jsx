import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiCheckCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPasswordOtp, setConfirmPasswordOtp] = useState('');
  const [step, setStep] = useState(0); // 0=email form, 1=OTP form, 2=email failed (contact support)
  const [supportEmail, setSupportEmail] = useState('thugxlifestyle6@gmail.com');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok && data.emailFailed) {
        // Email service is down — show contact support screen
        if (data.supportEmail) setSupportEmail(data.supportEmail);
        setSubmitted(true);
        setStep(2);
      } else {
        // Email sent (or account not found — security: don't reveal which)
        setSubmitted(true);
        setStep(1);
        toast.success('If an account exists with this email, you will receive a password reset code');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp.trim()) return toast.error('Please enter the code you received');
    if (!newPassword.trim() || newPassword !== confirmPasswordOtp) return toast.error('Passwords must match');

    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'reset', otp, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successful');
        navigate('/login');
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      toast.error('An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white">
            <div className="flex justify-center mb-4">
              {submitted ? (
                <HiCheckCircle className="w-16 h-16 text-green-600" />
              ) : (
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-4xl">✉️</div>
              )}
            </div>
            <h1 className="text-3xl font-bold">
              {step === 2 ? 'Contact Support' : submitted ? 'Check Your Email' : 'Forgot Password'}
            </h1>
          </div>

          {/* Content */}
          <div className="p-8">
            {!submitted ? (
              <>
                {/* Form Description */}
                <p className="text-gray-600 text-center mb-6">
                  Enter the email address associated with your account, and we'll send you a code to reset your password.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-colors duration-300"
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Sending...' : 'Send Reset Code'}
                  </button>
                </form>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">Or</span>
                  </div>
                </div>

                {/* Links */}
                <div className="space-y-3">
                  <Link
                    to="/login"
                    className="block text-center bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                  >
                    Back to Login
                  </Link>
                  <Link
                    to="/register"
                    className="block text-center text-purple-600 font-semibold py-3 hover:underline"
                  >
                    Create New Account
                  </Link>
                </div>
              </>
            ) : (
              <>
                {step === 2 ? (
                  /* Email service unavailable — contact support */
                  <div className="text-center space-y-6">
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
                      <p className="text-yellow-800 text-lg font-bold">⚠️ Email Service Unavailable</p>
                      <p className="text-gray-600 text-sm mt-2">
                        We couldn't send a reset code to <strong>{email}</strong> right now.
                      </p>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded text-left">
                      <p className="text-sm text-blue-900 font-semibold mb-2">To reset your password, contact us directly:</p>
                      <a
                        href={`mailto:${supportEmail}?subject=Password Reset Request&body=Please help me reset the password for: ${email}`}
                        className="block text-center bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-300 mt-3"
                      >
                        📧 Email Support: {supportEmail}
                      </a>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => { setSubmitted(false); setStep(0); }}
                        className="w-full border-2 border-purple-600 text-purple-600 font-semibold py-3 rounded-lg hover:bg-purple-50 transition-colors duration-300"
                      >
                        Try Again
                      </button>
                      <Link
                        to="/login"
                        className="block text-center text-gray-500 text-sm py-2 hover:underline"
                      >
                        Back to Login
                      </Link>
                    </div>
                  </div>
                ) : step === 1 ? (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Code</label>
                      <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                      <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm Password</label>
                      <input type="password" value={confirmPasswordOtp} onChange={(e) => setConfirmPasswordOtp(e.target.value)} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none" />
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg">
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </form>
                ) : null}

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 text-center mb-2">
                    <strong>Didn't receive an email?</strong>
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Check your spam or junk folder</li>
                    <li>• Make sure you entered the correct email</li>
                    <li>• Try resending after a few minutes</li>
                  </ul>
                </div>
              </>
            )}

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

        {/* Brand */}
        <p className="text-center text-white mt-6 text-sm">
          © 2026 Thugx Lifestyle. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
