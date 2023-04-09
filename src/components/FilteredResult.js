import React, { useState, useEffect } from 'react';
import { Box, Stack, Heading } from '@chakra-ui/react';
import Page from './Page';
import Pagination from './Pagination';
import axios from 'axios';

function FilteredResult({ types, checkedState, nameState }) {
    const [pokemons, setPokemons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pokemonsPerPage] = useState(10);

    useEffect(() => {
        axios.get('https://localhost:3000/api/v1/all')
            .then(res => res.data)
            .then(data => {
                // Filter the data based on the checkedState
                data = (data.filter(pokemon => checkedState.every((checked, i) => !checked || pokemon.type.includes(types.current[i]))));
            })
    })

    return (
        <Box>
            <Stack mb="3" p="2" spacing={{ base: '2', md: '3' }} textAlign="center" align="center">
                <Heading size='md'>Pokemon List</Heading>
            </Stack>
            <Page />
            <Pagination />
        </Box>
    )
}

export default FilteredResult