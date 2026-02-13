'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { faArrowLeft, faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';
import React, { useState } from 'react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = () => {
    if (!email) {
      setError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      await forgotPassword({ email });
      setIsSuccess(true);
    } catch (error) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden min-h-screen">
        <img src="/auth/forgot-password.png" alt="Forgot Password" className="w-full max-w-2xl h-auto object-contain" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 min-h-screen">
        <div className="w-full max-w-sm">
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-600 rounded-2xl mb-4 shadow-lg">
              <FontAwesomeIcon icon={faPaperPlane} className="text-white text-2xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Forgot Password?</h1>
            <p className="text-gray-600 text-sm">
              {isSuccess
                ? "Check your inbox for the magic link!"
                : "No worries! Enter your email and we'll send you a reset link"
              }
            </p>
          </div>

          {isSuccess ? (
            <div className="max-w-sm mx-auto">
              <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={faPaperPlane} className="text-white text-base" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-900 font-semibold mb-1 text-sm">
                      Reset link sent successfully!
                    </p>
                    <p className="text-green-800 text-xs">
                      We've sent a password reset link to <span className="font-semibold">{email}</span>
                    </p>
                    <p className="text-green-700 text-xs mt-2">
                      Please check your inbox and spam folder.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => setIsSuccess(false)}
                  className="border-2"
                >
                  <FontAwesomeIcon icon={faArrowLeft} />
                  Send Again
                </Button>
                <Link href="/auth/login" className="block">
                  <Button type="button" fullWidth>
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
              <div className="mb-4">
                <Input
                  type="email"
                  name="email"
                  label="Email Address"
                  placeholder="you@example.com"
                  value={email}
                  onChange={handleChange}
                  error={error}
                  icon={faEnvelope}
                />
              </div>

              <div className="space-y-2">
                <Button
                  type="submit"
                  fullWidth
                  isLoading={isLoading}
                  className="py-2 text-sm font-semibold bg-purple-600 hover:bg-purple-700"
                >
                  {!isLoading && <FontAwesomeIcon icon={faPaperPlane} />}
                  Send Reset Link
                </Button>

                <Link href="/auth/login" className="block">
                  <Button type="button" variant="outline" fullWidth className="border-2">
                    <FontAwesomeIcon icon={faArrowLeft} />
                    Back to Login
                  </Button>
                </Link>
              </div>

              <div className="mt-4 text-center">
                <p className="text-xs text-gray-600">
                  Remember your password?{' '}
                  <Link href="/auth/login" className="text-purple-600 hover:text-purple-700 font-semibold">
                    Sign in here
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
