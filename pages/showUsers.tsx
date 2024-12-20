import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Alert,
} from '@mui/material';
import Layout from '@/component/Layout';
import { getCookie } from '@/utils/cookie';
import { User } from '../models/user';

interface DashboardProps {
  userAll: {
    users: User[];
  };
}

export default function ShowUser() {
  const [userData, setUserData] = useState<any>(null);
  const [userDatas, setUserDatas] = useState<DashboardProps | null>(null);
  const [newUser, setNewUser] = useState<User>({
    fname: '',
    lname: '',
    username: '',
    email: '',
    password: '',
    tel: '',
    avatar: '',
    role: 'User',
  });
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false); // Dialog state
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false); // Delete confirmation dialog
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null); // Store the ID of the user to be deleted
  const [errorMessage, setErrorMessage] = useState<string>(''); // Error message for failed requests
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [itemsPerPage] = useState(5); // Items per page

  const router = useRouter();
  const token = getCookie('token');

  const handleNavigation = (path: string) => {
    router.push(path); // Programmatic navigation
  };
  const fetchUserList = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        const data = await res.json();
        setUserDatas(data || { users: [] }); // Update state with the new list of users
      } else {
        alert('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users');
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message || 'User created successfully!');
        setOpenDialog(false);
        setNewUser({
          fname: '',
          lname: '',
          username: '',
          email: '',
          password: '',
          tel: '',
          avatar: '',
          role: 'User',
        });
        fetchUserList();
      } else {
        alert(data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const handleDeleteClick = (id: number) => {
    setDeleteUserId(id);
    setOpenDeleteConfirm(true);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/manageuser/${deleteUserId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          //'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        alert('User deleted successfully!');
        // Remove the deleted user from state
        setUserDatas((prevState) => ({
          ...prevState!,
          users: prevState!.users.filter((user) => user.id !== deleteUserId),
        }));
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('An error occurred while deleting the user.');
    } finally {
      setLoading(false);
      setOpenDeleteConfirm(false);
    }
  };

  const handleCloseDeleteConfirm = () => setOpenDeleteConfirm(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search change
  };

  const paginateUsers = () => {
    // Filter users based on the search query
    const filteredUsers = userDatas?.users.filter(
      (user) =>
        user.fname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Get paginated users for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedUsers = filteredUsers?.slice(startIndex, startIndex + itemsPerPage);

    return { paginatedUsers, filteredUsers };
  };

  // Fetch user data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/protected', {
          method: 'GET',
          credentials: 'same-origin',
        });
        if (res.ok) {
          const data = await res.json();
          setUserData(data.user); // Store logged-in user data
          
          Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`, {
              headers: {
                'Content-Type': 'application/json',
                //'Authorization': `Bearer ${token}`,
              },
            })
              .then((res) => {
                if (!res.ok) {
                  throw new Error(`Failed to fetch users: ${res.statusText}`);
                }
                return res.json();
              })
          ])
            .then(([userDatas]) => {
              setUserDatas(userDatas || { users: [] }); // Fallback to an empty users array
            })
            .catch((error) => {
              console.error("Error fetching data:", error.message);
            })
            .finally(() => setLoading(false));
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Error fetching protected data:', error);
        router.push('/login');
      }
    };

    fetchData();

  }, [router]);

  const { paginatedUsers, filteredUsers } = paginateUsers();

  const totalPages = Math.ceil((filteredUsers?.length || 0) / itemsPerPage);

  return (
    <Layout>
      <Box sx={{ marginBottom: 3 }}>
        <Button variant="contained" color="primary" onClick={handleOpenDialog}>
          Create New User
        </Button>
      </Box>

      <Box
        sx={{
          bgcolor: 'background.paper',
          minHeight: '300px',
          padding: 3,
          borderRadius: 2,
          boxShadow: 2,
          marginTop: 3,
        }}
      >
        <Typography variant="h6" gutterBottom>
          User Data
        </Typography>

        <TextField
          label="Search Users"
          variant="outlined"
          fullWidth
          name = "Search"
          margin="normal"
          value={searchQuery}
          onChange={handleSearchChange}
        />

        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User Full Name</TableCell>
                <TableCell>UserName</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers?.length ? (
                paginatedUsers.map((user: User , ) => (
                  <TableRow key={user.id}>
                 
                    <TableCell>{user.fname} {user.lname}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        sx={{ ml: 1 }}
                        onClick={() => handleNavigation('/user/' + user.id)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ ml: 1 }}
                        color="error"
                        onClick={() => handleDeleteClick(user.id)}
                        disabled={user.id === userData?.id} // Disable delete if the user is the logged-in user
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Pagination controls */}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button
            variant="outlined"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Dialogs for user creation and deletion */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Create New User</DialogTitle>
        <DialogContent>
          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            name="fname"
            value={newUser.fname}
            onChange={handleInputChange}
          />
          <TextField
            label="Last Name"
            fullWidth
            margin="normal"
            name="lname"
            value={newUser.lname}
            onChange={handleInputChange}
          />
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            name="username"
            value={newUser.username}
            onChange={handleInputChange}
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            name="email"
            value={newUser.email}
            onChange={handleInputChange}
          />
          <TextField
            label="Phone Number"
            fullWidth
            margin="normal"
            name="tel"
            value={newUser.tel}
            onChange={handleInputChange}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            name="password"
            value={newUser.password}
            onChange={handleInputChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateUser} color="primary" disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this user?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
}
