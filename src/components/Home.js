import React, { useState, useRef, useEffect } from 'react';
import axois from 'axios';
import { Box, Stack, Heading, Divider } from '@chakra-ui/react';
import Search from './Search'
import FilteredResult from './FilteredResult';

function Home() {
    const [checkedState, setCheckedState] = useState([]);
    const [nameState, setNameState] = useState('');
    const types = useRef([]);

    useEffect(() => {
        async function getTypes() {
            const result = await axois.get('https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/types.json');
            types.current = result.data.map(type => type.english);
            setCheckedState(new Array(result.data.length).fill(false));
        }
        getTypes();
    }, []);

    return (
        <>
            <Box px='2' w="80%">
                <Stack mb="3" p="2" spacing={{ base: '2', md: '3' }} textAlign="center" align="center">
                    <Heading size={{ base: 'lg', md: 'lg' }}>Search Pokemons</Heading>
                </Stack>
                <Search types={types} checkedState={checkedState} setCheckedState={setCheckedState} setNameState={setNameState} />
                <Divider />
                <FilteredResult types={types} checkedState={checkedState} nameState={nameState} />
            </Box>

        </>
    )
}

export default Home