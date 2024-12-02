import { useState } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Typography, Box, Container, CircularProgress } from '@mui/material';

interface RegisterFormData {
  username: string;
  fname: string;
  lname: string;
  email: string;
  tel: string;
  avatar: string;
  password: string;
}

const RegisterPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    fname: '',
    lname: '',
    email: '',
    tel: '',
    avatar: '',
    password: '',
  });

  const [error, setError] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (
      !formData.username ||
      !formData.fname ||
      !formData.lname ||
      !formData.email ||
      !formData.tel ||
      !formData.avatar ||
      !formData.password
    ) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (error) {
      setError('An error occurred while registering');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 8, backgroundColor: '#121212', padding: 4, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ marginBottom: 2, color: 'white' }}>
          Register
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <TextField
            label="Username"
            name="username"
            variant="outlined"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' }
            }}
            InputProps={{
              style: { color: 'white' }, // White text color
              placeholder: 'Enter your username',
              
            }}
          />
          <TextField
            label="First Name"
            name="fname"
            variant="outlined"
            fullWidth
            value={formData.fname}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' }
            }}
            InputProps={{
              style: { color: 'white' }, // White text color
              placeholder: 'Enter your first name',
              
            }}
          />
          <TextField
            label="Last Name"
            name="lname"
            variant="outlined"
            fullWidth
            value={formData.lname}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' }
            }}
            InputProps={{
              style: { color: 'white' }, // White text color
              placeholder: 'Enter your last name',
              
            }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            variant="outlined"
            fullWidth
            value={formData.email}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' }
            }}
            InputProps={{
              style: { color: 'white' }, // White text color
              placeholder: 'Enter your email',
              
            }}
          />
          <TextField
            label="Phone"
            name="tel"
            type="tel"
            variant="outlined"
            fullWidth
            value={formData.tel}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' }
            }}
            InputProps={{
              style: { color: 'white' }, // White text color
              placeholder: 'Enter your phone number',
              
            }}
          />
          <TextField
            label="Avatar URL"
            name="avatar"
            variant="outlined"
            fullWidth
            value={formData.avatar}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' }
            }}
            InputProps={{
              style: { color: 'white' }, // White text color
              placeholder: 'Enter avatar URL',
              
            }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' }
            }}
            InputProps={{
              style: { color: 'white' }, // White text color
              placeholder: 'Enter your password',
              
            }}
          />

          {error && (
            <Typography color="error" sx={{ marginBottom: 2 }}>
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={isLoading}
            sx={{ marginBottom: 2 }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Register'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="text" color="secondary" href="/login">
              Already have an account? Login
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default RegisterPage;
