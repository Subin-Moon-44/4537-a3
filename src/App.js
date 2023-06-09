import React from 'react';
import Dashboard from './components/Dashboard'
import Login from './components/Login';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Report from './components/Report';
import { Box } from '@chakra-ui/react';
import { Routes, Route, Navigate } from 'react-router-dom';


function App() {
    const isAuthed = () => {
        const appid = localStorage.getItem('appid');
        return appid && appid.length > 0;
    }

    const isAdmin = () => {
        const role = localStorage.getItem('role');
        return isAuthed && role === 'admin' && role.length > 0;
    }

    return (
        <>
            <NavBar />
            <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                py='8'
                px='8'>
                <Routes>
                    <Route path="/report" element={
                        isAdmin() ? <Dashboard /> : <Navigate to="/login" />
                    } />
                    <Route path="/report/:reportId" element={
                        isAdmin() ? <Report /> : <Navigate to='/login' />
                    } />
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        isAdmin() ? <Navigate to="/report" /> : <Navigate to="/login" />
                    } />
                    <Route path="/home" element={
                        isAuthed() ? <Home /> : <Navigate to="/login" />
                    } />
                </Routes>
            </Box>
        </>
    )
}

export default App