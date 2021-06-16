import React, { FC, ReactNode, useContext } from 'react'
import NextLink from 'next/link'
import { AuthContext } from '../../context/AuthContext'
import { HStack, Box, Link, Button, Text, Flex, Spacer, Container } from "@chakra-ui/react"
import { LockIcon, UnlockIcon } from '@chakra-ui/icons';

const AuthBar: FC = ({ }) => {
  const { currentUser, states, actions } = useContext(AuthContext);

  if (states.loading) {
    return <div>Loading...</div>;
  }

  if (currentUser) {
    return (
      <HStack>
        <Text fontSize="sm">Bienvenue {currentUser.username}</Text>
        <Button
          colorScheme="teal"
          size="sm"
          onClick={() => actions.logout()}
        >
          <LockIcon mr={1} /> Logout
        </Button>
      </HStack>
    );
  }

  return (
    <Link as={NextLink} href="/login">
      <Button
        colorScheme="teal"
        size="sm"
      >
        <UnlockIcon mr={1} /> Login
      </Button>
    </Link>
  );
}

type Props = {
  children?: ReactNode
}

const Layout = ({ children }: Props) => {

  const { currentUser } = useContext(AuthContext);

  return (
    <div>
      <Box as="header" bg="purple.500" color="white" p={4} mb={4}>
        <Flex>
          <HStack as="nav" spacing="1em">
            <Box>
              <Link as={NextLink} href="/">Home</Link>
            </Box>
            {
              currentUser && (
                <Box>
                  <Link as={NextLink} href="/tasks">Tasks list</Link>
                </Box>
              )
            }
          </HStack>
          <Spacer />
          <AuthBar />
        </Flex>
      </Box>

      <Container as="main">
        {children}
      </Container>

    </div>
  )
}





export default Layout