import { Box, HStack, Heading } from '@chakra-ui/react';
import React from 'react';

function NavBar() {
    return (
        <Box as="nav" bg="#4488BF" boxShadow="sm" p="5">
            <HStack spacing="10" justify="space-between">
                <Heading color="#FFE338">
                    PokeDéx
                </Heading>
            </HStack>
        </Box>
    )
}

export default NavBar