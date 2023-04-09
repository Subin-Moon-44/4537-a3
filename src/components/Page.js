import React, { useState } from 'react';
import axios from 'axios';
import { Box, Wrap, WrapItem, VStack, Heading, Image, Button, Modal, Text, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, useDisclosure, HStack } from '@chakra-ui/react';


function Page({ currentPokemons }) {
    const [currPokemon, setCurrPokemon] = useState({ "name": { "english": "" }, "base": { "Sp": { " Attack": 0, " Defense": 0 }, "HP": 0, "Attack": 0, "Defense": 0, "Speed": 0 }, "type": [] });
    const { isOpen, onOpen, onClose } = useDisclosure();

    function handleClick(pokemonId) {
        axios.get('http://localhost:8080/api/v1/all')
            .then(res => res.data)
            .then(data => {
                // filter based on the id
                data = (data.filter(pokemon => pokemon.id === parseInt(pokemonId)));
                return data;
            })
            .then(res => {
                if (res.length > 0) {
                    setCurrPokemon(res[0]);
                    onOpen();
                } else {
                    setCurrPokemon("Not Available")
                }
            })
    };

    function modify_id(id) {
        if (parseInt(id) < 10) {
            id = "00" + id;
        } else if (parseInt(id) < 100) {
            id = "0" + id;
        }
        return id;
    }

    return (
        <Box mb={7}>
            <Wrap spacing={10} justify='center'>
                {currentPokemons.map(poke => {
                    let id = poke.id;
                    id = modify_id(id);
                    let imgSrc = `https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${id}.png`;

                    return (
                        <WrapItem borderRadius="lg" bg='#E6ECF0' w='200px' p='20px' key={poke.name.english}>
                            <VStack key={id} onClick={() => handleClick(poke.id)}>
                                <Heading size='md'>{poke.name.english}</Heading>
                                <Image src={imgSrc} alt={poke.name.english} id={id} />
                            </VStack>

                            <Modal isOpen={isOpen} onClose={onClose}>
                                <ModalOverlay />
                                <ModalContent alignItems='center'>
                                    {currPokemon === "Not Available" ? (
                                        <>
                                            <ModalHeader>Error</ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                <Text>Not available</Text>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button colorScheme='blue' mr={3} onClick={onClose}>
                                                    Close
                                                </Button>
                                            </ModalFooter>
                                        </>
                                    ) : (
                                        <>
                                            <ModalHeader>{currPokemon.name.english}</ModalHeader>
                                            <ModalCloseButton />
                                            <ModalBody>
                                                <HStack spacing={10}>
                                                    <Image src={`https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${modify_id(currPokemon.id)}.png`} alt={currPokemon.name.english} id={currPokemon.id} boxSize='100px' />
                                                    <Text>Type: {currPokemon.type.map(type => { return (`${type} `) })}
                                                        <br />HP: {currPokemon["base"]["HP"]}
                                                        <br />Attack: {currPokemon["base"]["Attack"]}
                                                        <br />Defense: {currPokemon["base"]["Defense"]}
                                                        <br />Speed: {currPokemon["base"]["Speed"]}
                                                        <br />Sp. Attack: {currPokemon["base"]["Sp"][" Attack"]}
                                                        <br />Sp. Defense: {currPokemon["base"]["Sp"][" Defense"]}
                                                    </Text>
                                                </HStack>
                                            </ModalBody>
                                            <ModalFooter>
                                                <Button colorScheme='blue' mr={3} onClick={onClose}>
                                                    Close
                                                </Button>
                                            </ModalFooter>
                                        </>)}
                                </ModalContent>
                            </Modal>
                        </WrapItem>
                    )
                })}
            </Wrap>
        </Box>
    )
}

export default Page