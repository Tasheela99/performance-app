'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import {
    faCamera,
    faEye,
    faEyeSlash,
    faLock,
    faUser
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Avatar, Box, CircularProgress } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AccountData {
  name: string;
  email: string;
  avatar?: string;
}

interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function AccountManagementPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [accountData, setAccountData] = useState<AccountData>({
    name: '',
    email: '',
    avatar: ''
  });
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    if (user) {
      setAccountData({
        name: user.name || '',
        email: user.email || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleAccountUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: accountData.name
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        updateUser(updatedUser);
        showMessage('success', 'Profile updated successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showMessage('error', 'New password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        showMessage('success', 'Password changed successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      showMessage('error', 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showMessage('error', 'Image must be less than 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Please select a valid image file');
      return;
    }

    setAvatarLoading(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/account/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const updatedAccountData = { ...accountData, avatar: result.avatarUrl };
        setAccountData(updatedAccountData);
        
        const updatedUser = { ...user, avatar: result.avatarUrl };
        updateUser(updatedUser);
        
        showMessage('success', 'Avatar updated successfully!');
      } else {
        const error = await response.json();
        showMessage('error', error.error || 'Failed to upload avatar');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showMessage('error', 'Failed to upload avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  return (
    <div className="p-6 lg:p-8 max-w-9xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FontAwesomeIcon icon={faUser} className="text-purple-600" />
          Account Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings and security</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h2>
            <div className="flex items-center gap-6">
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={accountData.avatar}
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    bgcolor: accountData.avatar ? 'transparent' : '#7c3aed'
                  }}
                >
                  {!accountData.avatar && accountData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </Avatar>
                {avatarLoading && (
                  <CircularProgress
                    size={80}
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      color: '#7c3aed'
                    }}
                  />
                )}
              </Box>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  id="avatar-upload"
                  disabled={avatarLoading}
                />
                <label
                  htmlFor="avatar-upload"
                  className={`inline-flex items-center gap-2 px-4 py-2 border border-purple-300 text-purple-600 rounded-lg hover:bg-purple-50 cursor-pointer transition-colors ${
                    avatarLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FontAwesomeIcon icon={faCamera} />
                  {avatarLoading ? 'Uploading...' : 'Change Avatar'}
                </label>
                <p className="text-xs text-gray-500 mt-2">
                  Upload a new profile picture (max 2MB, JPG/PNG)
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>
            <form onSubmit={handleAccountUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={accountData.name}
                  onChange={(e) => setAccountData({ ...accountData, name: e.target.value })}
                  placeholder="Your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={accountData.email}
                  placeholder="your.email@example.com"
                  disabled
                  className="!bg-gray-50 !text-gray-500 !cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email addresses cannot be changed for security reasons
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faLock} className="text-purple-600" />
              Change Password
            </h2>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={showPasswords.current ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={showPasswords.new ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Input
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('confirm')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FontAwesomeIcon icon={showPasswords.confirm ? faEyeSlash : faEye} />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </Button>
            </form>
          </Card>

          <Card className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Role:</span>
                <span className="font-medium text-gray-900 capitalize">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Member Since:</span>
                <span className="font-medium text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Updated:</span>
                <span className="font-medium text-gray-900">
                  {user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}