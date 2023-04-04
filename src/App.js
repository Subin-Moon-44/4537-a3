import NavBar from './components/NavBar';
import Login from './components/Login';
import { Container } from '@chakra-ui/react'

function App() {
  return (
    <>
      <NavBar />
      <Container py={{ base: '12', md: '24' }} px={{ base: '0', sm: '8' }} >
        <Login />
      </Container>
    </>
  );
}

export default App;
