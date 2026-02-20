'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { faBriefcase, faBuilding, faEnvelope, faEye, faEyeSlash, faLock, faRocket, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: '',
    position: '',
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await register({
        ...formData,
        acceptedTerms
      });
      
      if (result.needsVerification) {
        router.push(`/auth/verify-email?email=${encodeURIComponent(result.email)}`);
      } else {
        router.push('/dashboard');
      }
    } catch (error: any) {
      setErrors({ submit: error.message || 'Registration failed. Please try again.' });
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

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden min-h-screen">
        <img src="/auth/register.png" alt="Register" className="w-full max-w-2xl h-auto object-contain" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 min-h-screen">
        <div className="w-full max-w-lg">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg">
              <FontAwesomeIcon icon={faRocket} className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Start Your Journey</h1>
            <p className="text-gray-600 text-sm">Create your account and unlock powerful tools</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <Input
                type="text"
                name="name"
                label="Full Name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                icon={faUser}
              />

              <Input
                type="email"
                name="email"
                label="Email Address"
                placeholder="you@company.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                icon={faEnvelope}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="text"
                  name="department"
                  label="Department"
                  placeholder="Engineering"
                  value={formData.department}
                  onChange={handleChange}
                  icon={faBuilding}
                />

                <Input
                  type="text"
                  name="position"
                  label="Position"
                  placeholder="Developer"
                  value={formData.position}
                  onChange={handleChange}
                  icon={faBriefcase}
                />
              </div>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  label="Password"
                  placeholder="Minimum 6 characters"
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

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  label="Confirm Password"
                  placeholder="Re-enter password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  icon={faLock}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-14 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
                >
                  <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} className="text-sm" />
                </button>
              </div>
            </div>

            {errors.submit && (
              <div className="p-2 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <p className="text-xs text-red-700 font-medium">{errors.submit}</p>
              </div>
            )}

            <div className="pt-1">
              <label className="flex items-start cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)} 
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-2 focus:ring-purple-500 cursor-pointer" 
                  required 
                />
                <span className="ml-2 text-xs text-gray-700 group-hover:text-gray-900">
                  I agree to the{' '}
                  <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                    Privacy Policy
                  </Link>
                </span>
              </label>
            </div>

            <Button 
              type="submit" 
              fullWidth 
              isLoading={isLoading}
              className="py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700"
            >
              {!isLoading && <FontAwesomeIcon icon={faRocket} />}
              Create Account
            </Button>
          </form>

          <div className="mt-3 text-center">
            <span className="text-gray-600 text-xs">Already have an account? </span>
            <Link 
              href="/auth/login" 
              className="text-purple-600 hover:text-purple-700 font-semibold transition text-xs"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
