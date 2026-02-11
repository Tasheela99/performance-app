'use client';

import Card from '@/components/ui/Card';
import { useAuth } from '@/contexts/AuthContext';
import {
  faSearch,
  faUser,
  faUsers,
  faUserShield,
  faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CancelIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Avatar,
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridEventListener,
  GridRowEditStopReasons,
  GridRowModel,
  GridRowModes,
  GridRowModesModel
} from '@mui/x-data-grid';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
  department?: string;
  position?: string;
  createdAt: string;
  updatedAt: string;
}

export default function UserManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [rowModesModel, setRowModesModel] = useState<GridRowModesModel>({});
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

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
        setUsers(userData);
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

  const handleRowEditStop: GridEventListener<'rowEditStop'> = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const handleEditClick = (id: string) => () => {
    if (id === user?.id) {
      console.warn('Cannot edit your own role');
      return;
    }
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } });
  };

  const handleSaveClick = (id: string) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } });
  };

  const handleCancelClick = (id: string) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    });
  };

  const processRowUpdate = async (newRow: GridRowModel) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: newRow.id,
          role: newRow.role,
          name: newRow.name,
          email: newRow.email,
          department: newRow.department,
          position: newRow.position,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update user');
      }

      const updatedUser = { ...newRow };
      setUsers(users.map((row) => (row.id === newRow.id ? updatedUser : row)));
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
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

  const getRoleChipColor = (role: string): "error" | "info" | "success" => {
    switch (role) {
      case 'admin': return 'error';
      case 'manager': return 'info';
      default: return 'success';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'user',
      headerName: 'User',
      width: 80,
      editable: false,
      sortable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'start' }}>
          <Avatar
            src={params.row.avatar}
            sx={{
              bgcolor: params.row.avatar ? 'transparent' : '#7c3aed',
              width: 40,
              height: 40,
              fontSize: '0.875rem',
              fontWeight: 'bold'
            }}
          >
            {!params.row.avatar && params.row.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
          </Avatar>
        </Box>
      ),
    },
    {
      field: 'name',
      headerName: 'Name',
      minWidth: 120,
      editable: true,
      flex: 0.6,
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 160,
      editable: true,
      flex: 0.8,
    },
    {
      field: 'role',
      headerName: 'Role',
      minWidth: 140,
      editable: true,
      flex: 0.7,
      type: 'singleSelect',
      valueOptions: ['admin', 'manager', 'employee'],
      renderCell: (params) => (
        <Chip
          label={params.value.charAt(0).toUpperCase() + params.value.slice(1)}
          color={getRoleChipColor(params.value)}
          variant="outlined"
          icon={<FontAwesomeIcon icon={getRoleIcon(params.value)} />}
          sx={{ 
            minWidth: '100px',
            opacity: params.id === user?.id ? 0.7 : 1, // Visual indicator for non-editable
            '& .MuiChip-label': {
              paddingLeft: '8px',
              paddingRight: '12px'
            }
          }}
        />
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      minWidth: 120,
      editable: true,
      flex: 0.6,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'position',
      headerName: 'Position',
      minWidth: 120,
      editable: true,
      flex: 0.6,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      minWidth: 100,
      editable: false,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      minWidth: 100,
      cellClassName: 'actions',
      getActions: ({ id, row }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;
        
        if (isInEditMode) {
          return [
            <GridActionsCellItem
              key="save"
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id as string)}
            />,
            <GridActionsCellItem
              key="cancel"
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id as string)}
              color="inherit"
            />,
          ];
        }

        const actions = [
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id as string)}
            color="inherit"
          />,
        ];

        if (row.role === 'employee' || row.role === 'manager') {
          actions.unshift(
            <GridActionsCellItem
              key="progress"
              icon={<TrendingUpIcon />}
              label="Progress"
              onClick={() => router.push(`/dashboard/employees/${id}`)}
              color="primary"
            />
          );
        }

        return actions;
      },
    },
  ];

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
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Role Filter</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="Role Filter"
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="manager">Manager</MenuItem>
              <MenuItem value="employee">Employee</MenuItem>
            </Select>
          </FormControl>
        </div>
      </Card>

      {/* Users DataGrid */}
      <Card>
        <Box sx={{ height: 400, width: '100%' }}>
          <DataGrid
            rows={filteredUsers}
            columns={columns}
            loading={loading}
            editMode="row"
            rowModesModel={rowModesModel}
            onRowModesModelChange={setRowModesModel}
            onRowEditStop={handleRowEditStop}
            processRowUpdate={processRowUpdate}
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[5, 10, 25, 50]}
            disableRowSelectionOnClick
            disableColumnMenu
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid #f3f4f6',
                padding: '8px 16px',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: '#f9fafb',
                borderBottom: '1px solid #e5e7eb',
                fontWeight: 600,
                color: '#111827',
                minHeight: '44px!important',
              },
              '& .MuiDataGrid-row': {
                minHeight: '52px!important',
                '&:hover': {
                  backgroundColor: '#f9fafb',
                }
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb',
                minHeight: '48px',
                padding: '8px 16px',
              },
              '& .MuiTablePagination-root': {
                fontSize: '0.875rem',
              },
              '& .MuiTablePagination-displayedRows, & .MuiTablePagination-selectLabel': {
                fontSize: '0.875rem',
              },
            }}
            slotProps={{
              pagination: {
                showFirstButton: true,
                showLastButton: true,
              },
            }}
            getRowId={(row) => row.id}
          />
        </Box>
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