import { Box, SimpleGrid, HStack, InputGroup, Input, Button, Checkbox } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import React from 'react'

function Search({ types, checkedState, setCheckedState, setNameState }) {

    const onChangeHandle = (type) => {
        const index = types.current.indexOf(type);
        const newCheckedState = checkedState.map((item, i) => i === index ? !item : item);
        setCheckedState(newCheckedState);
    }

    const onChangeNameSearch = (e) => {
        console.log(e.target.value);
        setNameState(e.target.value);
    }

    return (
        <Box w='100%'>
            <HStack spacing={4} mb={3}>
                <SearchIcon />
                <InputGroup>
                    <Input
                        placeholder='Enter pokemon name'
                        onChange={(e) => onChangeNameSearch(e)} />
                </InputGroup>
                <Button bg="#4488BF" color="white">Search</Button>
            </HStack>
            <SimpleGrid columns={3} spacing={1} mb={5}>
                {types.current.map(type => {
                    return (
                        <Checkbox name="pokemonTypes" key={type} value={type} id={type} onChange={(() => { onChangeHandle(type) })}>{type}</Checkbox>
                    )
                })}
            </SimpleGrid>
        </Box>
    )
}

export default Search