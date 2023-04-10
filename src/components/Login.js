import React, { useState } from 'react';
import axios from 'axios';
import { FormControl, FormLabel, Input, Stack, Box, Heading, Image, Button } from '@chakra-ui/react';
import logo from '../asset/logo.png';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${process.env.PUBLIC_URL}/login`, { username, password });
      console.log(res.data);
      const user = res.data;
      if (user.role === 'admin' && user.isAuthenticated) {
        localStorage.setItem('appid', res.data.appid);
        localStorage.setItem('role', res.data.role);
        window.location.href = '/report';
      } else if (user.role === 'user' && user.isAuthenticated) {
        localStorage.setItem('appid', res.data.appid);
        localStorage.setItem('role', res.data.role);
        window.location.href = '/home'
      } else {
        alert("Invalid credentials");
        window.location.href = '/login';
      }
    } catch (err) {
      alert("Invalid credentials");
      window.location.href = '/login';
      console.log(err);
    }
  }

  return (
    <>
      <Box
        w="650px"
        py={{ base: '0', sm: '8' }}
        px={{ base: '4', sm: '10' }}
        boxShadow={{ base: 'md', sm: 'lg' }}
        borderRadius={{ base: 'none', sm: 'xl' }}
      >
        <Stack mb="10" p="2" spacing={{ base: '2', md: '3' }} textAlign="center" align="center">
          <Image src={logo} alt="logo" boxSize="30%" />
          <Heading size={{ base: 'lg', md: 'lg' }}>Log in to your account</Heading>
        </Stack>
        <Stack spacing="5">
          <form onSubmit={handleSubmit}>
            <FormControl mb="4">
              <FormLabel>Username</FormLabel>
              <Input placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
            </FormControl>
            <FormControl mb="7">
              <FormLabel>Password</FormLabel>
              <Input isRequired type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
            </FormControl>
            <Stack spacing="6">
              <Button type="submit" bgColor="#4488BF" color="#FFE338">
                Sign in
              </Button>
            </Stack>
          </form>
        </Stack>
      </Box>
    </>
  )
}

export default Login