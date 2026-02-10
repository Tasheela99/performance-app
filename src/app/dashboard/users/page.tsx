'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import {
    faChartLine,
    faEdit,
    faSave,
    faSearch,
    faTimes,
    faUser,
    faUsers,
    faUserShield,
    faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

interface EditingUser extends User {
  isEditing: boolean;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<EditingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUsers(userData.map((u: User) => ({ ...u, isEditing: false })));
      } else {
        const error = await response.json();
        console.error('Failed to fetch users:', error.error);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isEditing: true } : u));
  };

  const handleCancel = (userId: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, isEditing: false } : u));
  };

  const handleSave = async (userId: string) => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role: userToUpdate.role,
          name: userToUpdate.name,
          email: userToUpdate.email,
          department: userToUpdate.department,
          position: userToUpdate.position,
        }),
      });

      if (response.ok) {
        setUsers(users.map(u => u.id === userId ? { ...u, isEditing: false } : u));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    }
  };

  const handleInputChange = (userId: string, field: keyof User, value: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, [field]: value } : u
    ));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return faUserShield;
      case 'manager': return faUserTie;
      default: return faUser;
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800 border border-red-200';
      case 'manager': return 'bg-blue-100 text-blue-800 border border-blue-200';
      default: return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex justify-center items-center min-h-96">
          <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 lg:p-8">
        <Card className="text-center py-16">
          <FontAwesomeIcon icon={faUserShield} className="text-6xl text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <FontAwesomeIcon icon={faUsers} className="text-purple-600" />
          User Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">Manage users and their roles in the system</p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </Card>

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900">User</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Role</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Department</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Position</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900">Created</th>
                <th className="text-right py-4 px-4 font-semibold text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userRow) => (
                <tr key={userRow.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    {userRow.isEditing ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={userRow.name}
                          onChange={(e) => handleInputChange(userRow.id, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <input
                          type="email"
                          value={userRow.email}
                          onChange={(e) => handleInputChange(userRow.id, 'email', e.target.value)}
                          className="w-full px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold">
                          {userRow.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userRow.name}</p>
                          <p className="text-sm text-gray-500">{userRow.email}</p>
                        </div>
                      </div>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {userRow.isEditing ? (
                      <select
                        value={userRow.role}
                        onChange={(e) => handleInputChange(userRow.id, 'role', e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                        disabled={userRow.id === user?.id} // Can't change own role
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Manager</option>
                        <option value="employee">Employee</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(userRow.role)}`}>
                        <FontAwesomeIcon icon={getRoleIcon(userRow.role)} />
                        {userRow.role.charAt(0).toUpperCase() + userRow.role.slice(1)}
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {userRow.isEditing ? (
                      <input
                        type="text"
                        value={userRow.department || ''}
                        onChange={(e) => handleInputChange(userRow.id, 'department', e.target.value)}
                        placeholder="Department"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{userRow.department || '-'}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {userRow.isEditing ? (
                      <input
                        type="text"
                        value={userRow.position || ''}
                        onChange={(e) => handleInputChange(userRow.id, 'position', e.target.value)}
                        placeholder="Position"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      />
                    ) : (
                      <span className="text-sm text-gray-600">{userRow.position || '-'}</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(userRow.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    {userRow.isEditing ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          className="!py-1 !px-3 !text-xs"
                          onClick={() => handleSave(userRow.id)}
                        >
                          <FontAwesomeIcon icon={faSave} className="mr-1" />
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          className="!py-1 !px-3 !text-xs !text-red-600 !border-red-300 !hover:bg-red-50"
                          onClick={() => handleCancel(userRow.id)}
                        >
                          <FontAwesomeIcon icon={faTimes} className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {(userRow.role === 'employee' || userRow.role === 'manager') && (
                          <Button
                            variant="outline"
                            className="!py-1 !px-3 !text-xs !text-purple-600 !border-purple-300 !hover:bg-purple-50"
                            onClick={() => router.push(`/dashboard/employees/${userRow.id}`)}
                          >
                            <FontAwesomeIcon icon={faChartLine} className="mr-1" />
                            Progress
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          className="!py-1 !px-3 !text-xs"
                          onClick={() => handleEdit(userRow.id)}
                        >
                          <FontAwesomeIcon icon={faEdit} className="mr-1" />
                          Edit
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FontAwesomeIcon icon={faUsers} className="text-4xl text-gray-300 mb-4" />
              <p className="text-gray-500">No users found matching your criteria.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <Card className="!p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </Card>
        <Card className="!p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-sm text-gray-500">Admins</div>
        </Card>
        <Card className="!p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'manager').length}
          </div>
          <div className="text-sm text-gray-500">Managers</div>
        </Card>
        <Card className="!p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'employee').length}
          </div>
          <div className="text-sm text-gray-500">Employees</div>
        </Card>
      </div>
    </div>
  );
}