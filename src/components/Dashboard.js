import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Stack, Button, Heading, VStack } from '@chakra-ui/react';

function Dashboard() {
  return (
    <Box>
      <Stack mb="3" p="2" spacing={{ base: '2', md: '3' }} textAlign="center" align="center">
        <Heading size='lg'>DashBoard</Heading>
      </Stack>
      <VStack gap={2}>
        <Button w='full' size='lg' variant='outline' borderColor="#4488BF"><Link to="/report/1">Report 1 - Unique API users over a period of time</Link></Button>
        <Button w='full' size='lg' variant='outline' borderColor="#4488BF"><Link to="/report/2">Report 2 - Top API users over a period of time</Link></Button>
        <Button w='full' size='lg' variant='outline' borderColor="#4488BF"><Link to="/report/3">Report 3 - Top users for each Endpoint</Link></Button>
        <Button w='full' size='lg' variant='outline' borderColor="#4488BF"><Link to="/report/4">Report 4 - 4xx Errors By Enpoint</Link></Button>
        <Button w='full' size='lg' variant='outline' borderColor="#4488BF"><Link to="/report/5">Report 5 - Recent 4xx/5xx Errors</Link></Button>
      </VStack>
    </Box>
  )
}

export default Dashboard