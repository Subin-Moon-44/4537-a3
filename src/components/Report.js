import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import {
  Box, Stack, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer,
} from '@chakra-ui/react';


function Report() {
  const [reportEntries, setReportEntries] = useState([]);
  const [reportId] = useState(useParams().reportId);

  useEffect(() => {
    const appid = localStorage.getItem('appid');
    axios.get(`http://localhost:8080/api/v1/report/${reportId}?appid=${appid}`)
      .then((res) => {
        setReportEntries(res.data);
      })
  });

  const titles = [
    'Unique API users over a period of time',
    'Top API users over a period of time',
    'Top users for each Endpoint',
    '4xx Errors By Endpoint',
    'Recent 4xx/5xx Errors'
  ]

  const headers = {
    1: ['Index', 'Username', 'Count', ''],
    2: ['Index', 'Username', 'Count', ''],
    3: ['Index', 'Username', 'Count', 'Endpoint'],
    4: ['Index', 'Method', 'Status', 'Endpoint'],
    5: ['Index', 'Date', 'Method', 'Status'],
  };

  return (
    <Box p={3} border='1px' borderColor='#4488BF' borderRadius='lg'>
      <Stack mb="3" p="2" spacing={{ base: '2', md: '3' }
      } textAlign="center" align="center" >
        <Heading size='md'>Report {reportId && reportId} : {reportId && titles.length >= reportId && titles[reportId - 1]}</Heading>
      </Stack>
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              {headers[reportId].map(heading => {
                return (
                  <>
                    <Th>{heading}</Th>
                  </>
                )
              })}
            </Tr>
          </Thead>
          <Tbody>
            {reportEntries.map(entry => {
              return (
                <>
                  <Tr>
                    <Td key={entry.index}>{entry.index}</Td>
                    <Td key={entry.user}>{entry.user}</Td>
                    <Td key={entry.count}>{entry.user}</Td>
                    <Td key={entry.enpoint}>{entry.endpoint}</Td>
                  </Tr>
                </>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box >
  )
}

export default Report;