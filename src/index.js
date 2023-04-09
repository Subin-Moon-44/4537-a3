import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import App from './App';
import { ChakraProvider } from '@chakra-ui/react';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ChakraProvider>
    <Router>
      <App />
    </Router>
  </ChakraProvider>
);
