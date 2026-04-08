import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { HiEye, HiEyeOff, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { BACKEND_URL } from '../utils/api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [success, setSuccess] = useState(false);

  // Check password strength
  const checkPasswordStrength = (pwd) => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (/[a-z]/.test(pwd)) strength++;
    if (/[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[@$!%*?&]/.test(pwd)) strength++;
    setPasswordStrength(strength);
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { label: 'No Password', color: 'bg-gray-300' };
    if (passwordStrength <= 2) return { label: 'Weak', color: 'bg-red-500' };
    if (passwordStrength === 3) return { label: 'Fair', color: 'bg-yellow-500' };
    if (passwordStrength === 4) return { label: 'Strong', color: 'bg-green-500' };
    return { label: 'Very Strong', color: 'bg-green-600' };
  };

  const getPasswordErrors = () => {
    const errors = [];
    if (password.length < 8) errors.push('At least 8 characters');
    if (!/[a-z]/.test(password)) errors.push('Lowercase letter');
    if (!/[A-Z]/.test(password)) errors.push('Uppercase letter');
    if (!/\d/.test(password)) errors.push('Number');
    if (!/[@$!%*?&]/.test(password)) errors.push('Special character (@$!%*?&)');
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email is missing. Please use the reset link from your email.');
      return;
    }

    if (!password.trim()) {
      toast.error('Please enter a new password');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordStrength < 3) {
      toast.error('Password is too weak. Please meet all requirements.');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      toast.error('Invalid reset link. Missing token.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          token,
          newPassword: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        toast.success('Password reset successfully!');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        toast.error(data.message || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white">
              <HiCheckCircle className="w-16 h-16 mx-auto mb-4" />
              <h1 className="text-3xl font-bold">Password Reset Successful</h1>
            </div>

            {/* Content */}
            <div className="p-8 text-center space-y-4">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">✅ Your password has been successfully reset!</p>
              </div>

              <p className="text-gray-600">
                You can now log in with your new password. You will be redirected to the login page shortly.
              </p>

              <Link
                to="/login"
                className="inline-block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                Go to Login
              </Link>

              <p className="text-sm text-gray-500 mt-6">
                © 2026 Thugx Lifestyle. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-purple-600 to-pink-500 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="gradient-to-r from-purple-600 to-pink-600 p-8 text-center text-white">
            <h1 className="text-3xl font-bold">Reset Password</h1>
            <p className="text-purple-100 mt-2">Create a new secure password</p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Display (Read-only) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-colors duration-300 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${getPasswordStrengthLabel().color}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        {getPasswordStrengthLabel().label}
                      </span>
                    </div>

                    {/* Requirements */}
                    {getPasswordErrors().length > 0 && (
                      <div className="text-xs text-red-600 space-y-1">
                        <p className="font-semibold">Missing requirements:</p>
                        <ul className="list-disc list-inside">
                          {getPasswordErrors().map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200 transition-colors duration-300 pr-10"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
                  </button>
                </div>

                {/* Password Match Indicator */}
                {confirmPassword && (
                  <div className="mt-2 text-sm">
                    {password === confirmPassword ? (
                      <p className="text-green-600 font-semibold flex items-center gap-1">
                        <HiCheckCircle size={16} /> Passwords match
                      </p>
                    ) : (
                      <p className="text-red-600 font-semibold flex items-center gap-1">
                        <HiExclamationCircle size={16} /> Passwords don't match
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || passwordStrength < 3 || password !== confirmPassword}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? 'Resetting password...' : 'Reset Password'}
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

            {/* Back to Login Link */}
            <Link
              to="/login"
              className="block text-center bg-gray-100 text-gray-700 font-semibold py-3 rounded-lg hover:bg-gray-200 transition-colors duration-300"
            >
              Back to Login
            </Link>

            {/* Security Tips */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-700 mb-2">🔒 Password Security Tips:</p>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>✓ Use a unique password not used elsewhere</li>
                <li>✓ Include uppercase and lowercase letters</li>
                <li>✓ Add numbers and special characters</li>
                <li>✓ Change password regularly</li>
                <li>✓ Never share your password</li>
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

        {/* Brand */}
        <p className="text-center text-white mt-6 text-sm">
          © 2026 Thugx Lifestyle. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
