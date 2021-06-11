import React, { FC } from 'react';
import { AppProps } from 'next/app';
import { AuthContextProvider } from '../common/context/AuthContext';
import { ApolloProvider } from '@apollo/client/react';
import { FaunaApolloClient } from '../common/utils/';

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <ApolloProvider client={FaunaApolloClient}>
      <AuthContextProvider>
        <Component {...pageProps} />
      </AuthContextProvider>
    </ApolloProvider>
  );
}

export default App;
