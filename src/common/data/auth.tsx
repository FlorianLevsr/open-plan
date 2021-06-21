import React from 'react'
import { gql, TypedDocumentNode } from '@apollo/client/core'
import { useMutation, useQuery } from '@apollo/client/react'
import { createContext, FC } from 'react'
import { User } from '../types/fauna'
import { FaunaTokenManager } from '../utils'
import { useContext } from 'react'
import { MutationFromQuery } from '../types/apollo'
import { checkDefined } from '../utils/type-checks'

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

// ANCHOR Logout mutation return data structure
interface LogoutData {
  logoutData: boolean
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
export const query: TypedDocumentNode<CurrentUserData, undefined> = gql`
  query CurrentUserQuery {
    currentUser {
      _id
      username
    }
  }
`

// ANCHOR Describe login query
export const loginQuery: TypedDocumentNode<LoginData, LoginInput> = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(input: { username: $username, password: $password })
  }
`

// ANCHOR Describe logout query
export const logoutQuery: TypedDocumentNode<LogoutData> = gql`
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
  actions: {
    useLogin: () => MutationFromQuery<typeof loginQuery>
    useLogout: () => MutationFromQuery<typeof logoutQuery>
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

  // ANCHOR Mutation which allows to log in the application
  const useLogin = (): MutationFromQuery<typeof loginQuery> =>
    useMutation(loginQuery, {
      onCompleted: (data) => {
        faunaTokenManager.set(data.loginUser)
        refetch()
      },
    })

  // ANCHOR Mutation which allows to log out from the application
  const useLogout = (): MutationFromQuery<typeof logoutQuery> =>
    useMutation(logoutQuery, {
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
    actions: {
      useLogin,
      useLogout,
    },
  }

  if (typeof data !== 'undefined') {
    value = { ...value, ...data }
  }

  // ANCHOR Template
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
