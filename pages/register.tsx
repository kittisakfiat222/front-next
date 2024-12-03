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
  password?: string; // Optional field to avoid unnecessary handling in state
}

const RegisterPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<Omit<RegisterFormData, 'password'>>({
    username: '',
    fname: '',
    lname: '',
    email: '',
    tel: '',
    avatar: '',
  });

  const [password, setPassword] = useState<string>(''); // Handle password separately
  const [error, setError] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'password') {
      setPassword(value); // Handle password separately
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate fields
    if (
      !formData.username ||
      !formData.fname ||
      !formData.lname ||
      !formData.email ||
      !formData.tel ||
      !formData.avatar ||
      !password
    ) {
      setError('All fields are required.');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, password }), // Include password in submission
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.message || 'Registration failed.');
      }
    } catch (error) {
      setError('An error occurred while registering.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginTop: 8,
          backgroundColor: '#121212',
          padding: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2, color: 'white' }}>
          Register
        </Typography>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {['username', 'fname', 'lname', 'email', 'tel', 'avatar'].map((field) => (
            <TextField
              key={field}
              label={field.charAt(0).toUpperCase() + field.slice(1)}
              name={field}
              variant="outlined"
              fullWidth
              value={formData[field as keyof Omit<RegisterFormData, 'password'>]}
              onChange={handleChange}
              sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
              InputLabelProps={{ style: { color: '#fff' } }}
              InputProps={{
                style: { color: 'white' },
                placeholder: `Enter your ${field}`,
              }}
            />
          ))}
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{ style: { color: '#fff' } }}
            InputProps={{
              style: { color: 'white' },
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
