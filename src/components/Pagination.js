import React, { useState, useEffect } from 'react';
import { Box, Button, ButtonGroup } from '@chakra-ui/react';


function Pagination({ numPage, currentPage, setCurrentPage }) {
    const [activeBtn, setActiveBtn] = useState(1);
    const pageNumbers = []

    useEffect(() => {
        const cachedPage = localStorage.getItem('currentPage');
        if (cachedPage) {
            setCurrentPage(parseInt(cachedPage));
            setActiveBtn(parseInt(cachedPage));
        }
    }, [setCurrentPage]);

    for (let i = 1; i <= numPage; i++) {
        pageNumbers.push(i);
    }

    const nextPage = () => {
        if (currentPage !== numPage) setCurrentPage(currentPage + 1);
    }
    const prevPage = () => {
        if (currentPage !== 1) setCurrentPage(currentPage - 1);
    }

    return (
        <Box>
            <ButtonGroup gap='1'>
                {(currentPage !== 1) && (<Button onClick={prevPage}>prev</Button>)}

                {
                    pageNumbers.map(num => {
                        if (num < currentPage + 10 && num > currentPage - 10) {
                            return (
                                <Button key={num} onClick={() => setCurrentPage(num)} className={(num === currentPage) ? 'active' : ''} backgroundColor={(num === currentPage) ? '#FFE338' : ''}>
                                    {num}
                                </Button>
                            )
                        } return null
                    })
                }

                {(currentPage !== numPage) && (<Button onClick={nextPage}>next</Button>)}
            </ButtonGroup>
        </Box>
    )
}

export default Pagination