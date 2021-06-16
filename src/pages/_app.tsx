import React, { FC } from 'react';
import { AppProps } from 'next/app';
import { AuthContextProvider } from '../common/context/AuthContext';
import { ApolloProvider } from '@apollo/client/react';
import { FaunaApolloClient } from '../common/utils/';
import { ChakraProvider } from "@chakra-ui/react"

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={FaunaApolloClient}>
      <AuthContextProvider>
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
      </AuthContextProvider>
    </ApolloProvider>
  );
}

export default App;
