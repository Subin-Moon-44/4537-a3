import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from './components/Login';
import NavBar from './components/NavBar';
import { ChakraProvider, Container } from '@chakra-ui/react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <NavBar />
    <Container py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }} >
      <Router>
        <Login />
      </Router>
    </Container>
  </ChakraProvider>
);
