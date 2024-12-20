import type { GetStaticPaths, GetStaticProps } from 'next';
import { useState , useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Container,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import Layout from '@/component/Layout';
import { getCookie } from '@/utils/cookie';

interface Pet {
  id: number;
  name: string;
  avatar: string;
}

interface User {
  id: number;
  username: string;
  fname?: string;
  lname?: string;
  avatar: string;
  password: string;
  email?: string;
  tel?: string;
  role: string;
  pets: Pet[];
}

interface UserProps {
  getuser: {
    users: User;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const UserPage =  ({ getuser }: UserProps) =>  {
  const router = useRouter();
  const token = getCookie('token');
  // const [userData, setUserData] = useState<any>(null);  // Store resolved data

  useEffect(() => {
    if (!token) {
      console.error('Error fetching user data');
      router.push('/login')
    }
  }), [token, router]
  
 

  
  const [formData, setFormData] = useState({
    username: getuser.users.username || '',
    fname: getuser.users.fname || '',
    lname: getuser.users.lname || '',
    avatar: getuser.users.avatar || '',
    password: '',
    email: getuser.users.email || '',
    tel: getuser.users.tel || '',
    role: getuser.users.role || 'User',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name as string]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/manageuser/${getuser.users.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        alert('User updated successfully!');
        router.push('/showUsers'); // Redirect after success
      } else {
        console.error('Failed to update user:', await res.text());
        alert('Failed to update user.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred while updating the user.');
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Card sx={{ maxWidth: 345 }}>
          <CardMedia
            sx={{ height: 140 }}
            image={getuser.users.avatar}
            title={`${getuser.users.fname} ${getuser.users.lname}`}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="div">
              {getuser.users.fname} {getuser.users.lname}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {getuser.users.username}
            </Typography>
          </CardContent>
        </Card>
      </Container>

      {/* Input Form */}
      <Container maxWidth="md" sx={{ marginTop: 4 }}>
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            required
            disabled
          />
          <TextField
            label="First Name"
            name="fname"
            value={formData.fname}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Last Name"
            name="lname"
            value={formData.lname}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Avatar URL"
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Phone Number"
            name="tel"
            value={formData.tel}
            onChange={handleChange}
            fullWidth
          />
          
          {/* Role Selection */}
          <FormControl fullWidth required>
            <InputLabel>Role</InputLabel>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              label="Role"
            >
              <MenuItem value="Admin">Admin</MenuItem>
              <MenuItem value="User">User</MenuItem>
              <MenuItem value="Cashier">Cashier</MenuItem>
            </Select>
          </FormControl>
          
          <Button type="submit" variant="contained" color="primary">
            Save 
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users`);
    const data = await res.json();
    const paths = data.users.map((users: User) => ({
      params: { id: String(users.id) },
    }));

    return { paths, fallback: false };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { paths: [], fallback: false };
  }
};

export const getStaticProps: GetStaticProps = async (context) => {
  const { id } = context.params!;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/${id}`);
    const getuser = await res.json();

    

    return {
      props: { getuser },
      revalidate: 10, // Regenerate the page every 10 seconds
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { notFound: true };
  }
};

export default UserPage;
