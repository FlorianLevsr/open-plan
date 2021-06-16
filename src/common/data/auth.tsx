import React from 'react'
import { gql } from '@apollo/client/core'
import { useMutation, useQuery } from '@apollo/client/react'
import { useRouter } from 'next/router'
import { createContext, FC } from 'react'
import { User } from '../types/fauna'
import { FaunaTokenManager } from '../utils'
import { checkDefined } from '../utils/type-checks'
import { useContext } from 'react'

/**
 * SECTION Interfaces
 */

// ANCHOR Query data structure
export interface CurrentUserData {
  currentUser?: User | null
}

// ANCHOR Login mutation return data structure
interface LoginData {
  loginUser: string
}

// ANCHOR Login input data structure
interface LoginInput {
  username: string
  password: string
}
/**
 * !SECTION
 */

/**
 * SECTION GraphQL queries
 */

// ANCHOR Describe query
export const query = gql`
  query CurrentUserQuery {
    currentUser {
      _id
      username
    }
  }
`

// ANCHOR Describe login query
export const loginQuery = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(input: { username: $username, password: $password })
  }
`

// ANCHOR Describe logout query
const logoutQuery = gql`
  mutation LogoutUser {
    logoutUser
  }
`
/**
 * !SECTION
 */

/**
 * SECTION Context
 */

// ANCHOR Context value structure
interface AuthContextValue extends CurrentUserData {
  states: {
    mutationLoading: boolean
  }
  actions: {
    login: (username: string, password: string) => void
    logout: () => void
  }
}

// ANCHOR Context creation
export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
)

// ANCHOR Use Context hook
export const useAuthContext = (): AuthContextValue =>
  checkDefined(
    useContext(AuthContext),
    'AuthContext should not be undefined. Did you forget yo wrap your component inside a Provider?'
  )

// ANCHOR Context provider
export const AuthContextProvider: FC = ({ children }) => {
  /**
   * SECTION Apollo hooks
   */

  // ANCHOR Send request using Apollo client
  const faunaTokenManager = new FaunaTokenManager()
  const { data, refetch } = useQuery<CurrentUserData>(query, {
    errorPolicy: 'all',
  })

  const router = useRouter()

  // ANCHOR Mutation which allows to log in the application
  const [loginMutation, { loading: mutationLoading }] = useMutation<
    LoginData,
    LoginInput
  >(loginQuery, {
    onCompleted: (data) => {
      faunaTokenManager.set(data.loginUser)
      refetch()
    },
  })

  // ANCHOR Mutation which allows to log out from the application
  const [logoutMutation] = useMutation(logoutQuery, {
    onCompleted: () => {
      faunaTokenManager.reset()
      refetch()
    },
  })
  /**
   * !SECTION
   */

  // ANCHOR Pack data and actions to dispatch through components
  let value = {
    states: {
      mutationLoading,
    },
    actions: {
      login: (username: string, password: string) =>
        loginMutation({ variables: { username, password } }),
      logout: () => {
        logoutMutation()
        router.push('/')
      },
    },
  }

  if (typeof data !== 'undefined') {
    value = { ...value, ...data }
  }

  // ANCHOR Template
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
