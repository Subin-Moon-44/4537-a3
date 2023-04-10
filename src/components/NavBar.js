import { Box, HStack, Heading, Button } from '@chakra-ui/react';
import React from 'react';
import axios from 'axios';

function NavBar() {
    const isAuthed = () => {
        const appid = localStorage.getItem('appid');
        return appid && appid.length > 0;
    }

    const logout = () => {
        const appid = localStorage.getItem('appid');
        localStorage.removeItem('appid');
        localStorage.removeItem('role');
        localStorage.removeItem('currentPage');
        axios.post(`${process.env.AUTHSERVER_URL}/logout`, { appid: appid }).then(() => { });
        window.location.href = '/login';
    }

    return (
        <Box as="nav" bg="#4488BF" boxShadow="sm" p="5">
            <HStack spacing="10" justify="space-between">
                <Heading id="logo" color="#FFE338">
                    PokeDéx
                </Heading>
                <Button
                    style={{ visibility: isAuthed ? 'visible' : 'hidden' }}
                    variant="outline"
                    color="white"
                    onClick={() => { logout() }}
                >
                    Logout</Button>
            </HStack>
        </Box>
    )
}


export default NavBar