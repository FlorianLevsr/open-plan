import React, { FC } from 'react'
import NextLink from 'next/link'
import {
  HStack,
  Box,
  Link,
  Button,
  Text,
  Flex,
  Spacer,
  Container,
} from '@chakra-ui/react'
import { LockIcon, UnlockIcon } from '@chakra-ui/icons'
import { useAuthContext } from '../../data/auth'

const AuthBar: FC = () => {
  const { currentUser, actions } = useAuthContext()
  const [logout, { loading }] = actions.useLogout()

  if (currentUser) {
    return (
      <HStack>
        <Text fontSize="sm">Welcome {currentUser.username}</Text>
        <Button
          colorScheme="teal"
          size="sm"
          isLoading={loading}
          onClick={() => logout()}
        >
          <LockIcon mr={1} /> Logout
        </Button>
      </HStack>
    )
  }

  return (
    <Link as={NextLink} href="/login">
      <Button colorScheme="teal" size="sm" isLoading={loading}>
        <UnlockIcon mr={1} /> Login
      </Button>
    </Link>
  )
}

const Layout: FC = ({ children }) => {
  const { currentUser } = useAuthContext()

  return (
    <div>
      <Box as="header" bg="purple.500" color="white" p={4} mb={4}>
        <Flex>
          <HStack as="nav" spacing="1em">
            <Box>
              <Link as={NextLink} href="/">
                Home
              </Link>
            </Box>
            {currentUser && (
              <Box>
                <Link as={NextLink} href="/tasks">
                  Tasks list
                </Link>
              </Box>
            )}
          </HStack>
          <Spacer />
          <AuthBar />
        </Flex>
      </Box>

      <Container as="main">{children}</Container>
    </div>
  )
}

export default Layout
