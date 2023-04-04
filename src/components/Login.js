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
      const res = await axios.post("http://localhost:3000/login", { username, password });
      // ?
      console.log(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <Box
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
              <Input placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
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