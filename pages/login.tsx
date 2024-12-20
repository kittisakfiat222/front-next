import { useState } from 'react';
import { useRouter } from 'next/router';
import { TextField, Button, Typography, Box, Container, CircularProgress } from '@mui/material';

interface LoginFormData {
  username: string;
}

const LoginPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
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

    // Validate inputs
    if (!formData.username || !password) {
      setError('Username and Password are required.');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, password }), // Include password securely in the request body
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.message || 'Login failed.');
      }
    } catch (error) {
      setError('An error occurred while logging in.');
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
          Login
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
              style: { color: '#fff' },
            }}
            InputProps={{
              style: { color: 'white' },
              placeholder: 'Enter your username',
            }}
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            fullWidth
            value={password}
            onChange={handleChange}
            sx={{ marginBottom: 2, backgroundColor: '#333', color: 'white' }}
            InputLabelProps={{
              style: { color: '#fff' },
            }}
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
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Log in'}
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button variant="text" color="secondary" href="/register">
              Don't have an account? Register
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
};

export default LoginPage;
