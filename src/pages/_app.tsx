import React, { FC, useEffect, useState } from 'react'
import { AppProps } from 'next/app'
import { ApolloProvider } from '@apollo/client/react'
import { FaunaApolloClient } from '../common/utils/'
import { ChakraProvider } from '@chakra-ui/react'
import { AuthContextProvider } from '../common/data/auth'
import Router from "next/router";
import { PageLoader } from '../common/components'
import '../styles/global-style.css'

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const start = () => {
      setLoading(true);
    };
    const end = () => {
      setLoading(false);
    };
    Router.events.on("routeChangeStart", start);
    Router.events.on("routeChangeComplete", end);
    Router.events.on("routeChangeError", end);
    return () => {
      Router.events.off("routeChangeStart", start);
      Router.events.off("routeChangeComplete", end);
      Router.events.off("routeChangeError", end);
    };
  }, []);
  return (
    <ApolloProvider client={FaunaApolloClient}>
      <AuthContextProvider>
        <ChakraProvider>
          {loading && <PageLoader />}
          <Component {...pageProps} />
        </ChakraProvider>
      </AuthContextProvider>
    </ApolloProvider>
  )
}

export default App
