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
        const appid = localStorage.getItem('appid');
        axios.get(`http://localhost:8080/api/v1/all?appid=${appid}`)
            .then(res => res.data)
            .then(data => {
                // Filter the data based on the checkedState
                data = (data.filter(pokemon => checkedState.every((checked, i) => !checked || pokemon.type.includes(types.current[i]))));
                // Filter based on the name search
                data = (data.filter(pokemon => pokemon.name.english.toLowerCase().includes(nameState.toLowerCase())));
                return data;
            })
            .then(res => {
                setPokemons(res)
                setCurrentPage(1)
            })
            .catch(err => console.log(err));
    }, [checkedState, nameState, types])

    const indexOfLastItem = currentPage * pokemonsPerPage;
    const indexOfFirstItem = indexOfLastItem - pokemonsPerPage;
    const currentPokemons = pokemons.slice(indexOfFirstItem, indexOfLastItem);
    const numPage = Math.ceil(pokemons.length / pokemonsPerPage);

    return (
        <Box alignItems='center'>
            <Stack mb="3" p="2" spacing={{ base: '2', md: '3' }} textAlign="center" align="center">
                <Heading size='lg'>Pokemon List</Heading>
            </Stack>
            <Page currentPokemons={currentPokemons} currentPage={currentPage} />
            <Pagination numPage={numPage} currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </Box>
    )
}

export default FilteredResult;