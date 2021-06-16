import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  NormalizedCacheObject,
} from '@apollo/client/core'
import { createHttpLink } from '@apollo/client/link/http'
import { setContext } from '@apollo/client/link/context'
import FaunaTokenManager from './fauna-token-manager'

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_FAUNA_GRAPHQL_DOMAIN + '/graphql',
})

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const faunaTokenManager = new FaunaTokenManager()
  const token = faunaTokenManager.get()

  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: `Bearer ${token}`,
    },
  }
})

const createStaticAuthLink = (token: string): ApolloLink =>
  setContext((_, { headers }) => {
    // return the headers to the context so httpLink can read them
    return {
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }
  })

const createCache = (): InMemoryCache =>
  new InMemoryCache(/*{
    typePolicies: {
      Query: {
        fields: {
          findUserByID: (_, { args, toReference }) => toReference({
            __typename: 'User',
            _id: args?.id
          }),
          findTaskByID: (_, { args, toReference }) => toReference({
            __typename: 'Task',
            _id: args?.id
          }),
        }
      }
    }
  }*/)

export const createFaunaApolloClient = (
  token: string
): ApolloClient<NormalizedCacheObject> =>
  new ApolloClient({
    link: createStaticAuthLink(token).concat(httpLink),
    cache: createCache(),
  })

const FaunaApolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: createCache(),
})

export default FaunaApolloClient
