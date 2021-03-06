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
import { SmallAddIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons'
import { useAuthContext } from '../../data/auth'
import { useRouter } from 'next/router'

const AuthBar: FC = () => {
  const { currentUser, actions } = useAuthContext()
  const [logout, { loading }] = actions.useLogout()
  const router = useRouter()

  if (currentUser) {
    return (
      <HStack>
        <Text fontSize="sm">Welcome {currentUser.username}</Text>
        <Button
          colorScheme="teal"
          size="sm"
          isLoading={loading}
          onClick={async () => {
            await logout()
            router.push('/')
          }}
        >
          <LockIcon mr={1} /> Logout
        </Button>
      </HStack>
    )
  }

  return (
    <HStack>
      <Link as={NextLink} href="/signup">
        <Button colorScheme="teal" size="sm" isLoading={loading}>
          <SmallAddIcon mr={1} /> Sign up
        </Button>
      </Link>
      <Link as={NextLink} href="/login">
        <Button colorScheme="teal" size="sm" isLoading={loading}>
          <UnlockIcon mr={1} /> Log in
        </Button>
      </Link>
    </HStack>
  )
}

const Layout: FC = ({ children }) => {
  const { currentUser } = useAuthContext()

  return (
    <div>
      <Box as="header" bg="purple.500" color="white" p={4} mb={4}>
        <Flex as="nav">
          <HStack as="ul" spacing="1em">
            <Box as="li">
              <Link as={NextLink} href="/">
                Home
              </Link>
            </Box>
            {currentUser && (
              <Box as="li">
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
