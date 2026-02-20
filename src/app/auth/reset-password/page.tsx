'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { faCheckCircle, faEye, faEyeSlash, faLock, faShieldHalved } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useEffect, useState } from 'react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword } = useAuth();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const resetToken = searchParams.get('token');
    if (!resetToken) {
      setErrors({ token: 'Invalid or missing reset token' });
    } else {
      setToken(resetToken);
    }
  }, [searchParams]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else {
      const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!token) {
      setErrors({ token: 'Invalid reset token' });
      return;
    }

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await resetPassword({
        token,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      setIsSuccess(true);
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (error) {
      setErrors({ submit: 'Failed to reset password. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);
  const hasMinLength = formData.password.length >= 8;

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <img src="/auth/reset-password.png" alt="Reset Password" className="w-full max-w-2xl h-auto object-contain" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-lg">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg ${
                isSuccess 
                  ? 'bg-green-600'
                  : 'bg-purple-600'
              }`}>
                <FontAwesomeIcon 
                  icon={isSuccess ? faCheckCircle : faLock} 
                  className="text-white text-2xl" 
                />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {isSuccess ? 'All Set!' : 'Reset Your Password'}
              </h1>
              <p className="text-gray-600 text-lg">
                {isSuccess 
                  ? 'Your password has been successfully updated'
                  : 'Choose a strong password to secure your account'
                }
              </p>
            </div>

            {errors.token && (
              <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-white text-xl">⚠</span>
                  </div>
                  <div>
                    <p className="text-red-900 font-semibold mb-1">Invalid or Expired Link</p>
                    <p className="text-red-800 text-sm mb-3">{errors.token}</p>
                    <Link href="/auth/forgot-password">
                      <Button variant="outline" className="text-sm">
                        Request New Reset Link →
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {!errors.token && isSuccess && (
              <div className="text-center space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <FontAwesomeIcon icon={faCheckCircle} className="text-white text-xl" />
                    </div>
                    <p className="text-green-900 font-bold text-lg">Password Updated!</p>
                  </div>
                  <p className="text-green-800 text-sm">
                    You can now sign in with your new password
                  </p>
                </div>

                <Link href="/auth/login" className="block">
                  <Button 
                    type="button" 
                    fullWidth
                    className="py-3 text-base font-semibold bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Login →
                  </Button>
                </Link>
              </div>
            )}

            {!errors.token && !isSuccess && (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      label="New Password"
                      placeholder="Enter strong password"
                      value={formData.password}
                      onChange={handleChange}
                      error={errors.password}
                      icon={faLock}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-14 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
                    >
                      <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} className="text-sm" />
                    </button>
                  </div>
                  
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password must include:</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasMinLength ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasUpperCase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Uppercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasLowerCase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Lowercase letter</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasNumber ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                        <span>Number</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    label="Confirm New Password"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    icon={faLock}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
                  >
                    <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-sm" />
                  </button>
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{errors.submit}</p>
                  </div>
                )}

                <Button 
                  type="submit" 
                  fullWidth 
                  isLoading={isLoading}
                  className="py-3 text-base font-semibold bg-purple-600 hover:bg-purple-700"
                >
                  {!isLoading && <FontAwesomeIcon icon={faShieldHalved} />}
                  Reset Password
                </Button>

                <div className="text-center pt-4">
                  <p className="text-sm text-gray-600">
                    Remember your password?{' '}
                    <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                      Sign in
                    </Link>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
