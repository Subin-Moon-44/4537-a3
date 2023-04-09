import React from 'react';
import { Box, Wrap, WrapItem, VStack, Heading, Image } from '@chakra-ui/react';


function Page({ currentPokemons }) {
    const handleClick = (pokemonId) => {
        // TODO: model widnow => pokemon info
    }

    return (
        <Box mb={7}>
            <Wrap spacing={10} justify='center'>
                {currentPokemons.map(poke => {
                    let id = poke.id;
                    if (parseInt(id) < 10) {
                        id = "00" + poke.id;
                    } else if (parseInt(id) < 100) {
                        id = "0" + poke.id;
                    }
                    let imgSrc = `https://raw.githubusercontent.com/fanzeyi/pokemon.json/master/images/${id}.png`;
                    return (
                        <WrapItem borderRadius="lg" bg='#E6ECF0' w='200px' p='20px' key={poke.name.english}>
                            <VStack key={id}>
                                <Heading size='md'>{poke.name.english}</Heading>
                                <Image src={imgSrc} alt={poke.name.english} id={id} />
                            </VStack>
                        </WrapItem>
                    )
                })}
            </Wrap>
        </Box>
    )
}

export default Page