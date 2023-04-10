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
    'Unique API users over a period of time (24h)',
    'Top API users over a period of time (24h)',
    'Top users for each Endpoint',
    '4xx Errors By Endpoint',
    'Recent 4xx/5xx Errors'
  ]

  const headers = {
    1: ['Index', 'Username', 'Count', ''],
    2: ['Index', 'Username', 'Count', ''],
    3: ['Index', 'Username', 'Count', 'Endpoint'],
    4: ['Index', 'Count', 'Endpoint', ''],
    5: ['Index', 'Date', 'Method', 'Status'],
  };

  return (
    <Box p={3} border='1px' borderColor='#4488BF' borderRadius='lg'>
      <Stack mb="3" p="2" spacing={{ base: '2', md: '3' }
      } textAlign="center" align="center" >
        <Heading size='md'>Report {reportId && reportId} : {reportId && titles.length >= reportId && titles[reportId - 1]}</Heading>
      </Stack>
      <TableContainer key={"table-wrapper"}>
        <Table key={"table"} variant='simple'>
          <Thead key={"table-thread"}>
            <Tr key={"table-tr"}>
              {headers[reportId].map((heading, index) => {
                return (
                  <>
                    <Th key={"table-th-" + index}>{heading}</Th>
                  </>
                )
              })}
            </Tr>
          </Thead>
          <Tbody key={"table-tbody"}>
            {reportEntries.map((entry, index) => {
              return (
                <>
                  <Tr key={"table-tr" + index}>
                    <Td key={"table-td-" + index + "0"}>{entry.index}</Td>
                    <Td key={"table-td-" + index + "1"}>{entry.user}</Td>
                    <Td key={"table-td-" + index + "2"}>{entry.count}</Td>
                    <Td key={"table-td-" + index + "3"}>{entry.endpoint}</Td>
                  </Tr>
                </>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default Report;