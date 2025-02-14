import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Container, Alert } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'https://frontend-take-home-service.fetch.com';

const Login = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!name || !email) {
      setError('Please enter both name and email.');
      return;
    }

    try {
      // Send login request to the API
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        { name, email },
        { withCredentials: true } // Include credentials (cookies)
      );

      if (response.status === 200) {
        // Redirect to the search page after successful login
        navigate('/search');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Failed to log in. Please check your name and email.');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom>
          Login
        </Typography>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Login Form */}
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Log In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;