import React, { FC } from 'react'
import { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client/react'
import { FaunaApolloClient } from '../common/utils/'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthContextProvider } from '../common/data/auth'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={FaunaApolloClient}>
      <AuthContextProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </AuthContextProvider>
    </ApolloProvider>
  )
}

export default App
