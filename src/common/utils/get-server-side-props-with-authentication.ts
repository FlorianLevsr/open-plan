import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { createFaunaApolloClient } from "./fauna-apollo-client";
import { CurrentUserData, query } from "../context/AuthContext";
import FaunaTokenManager from "./fauna-token-manager";
import * as cookie from 'cookie';
import { User } from "../types/fauna";
import { ApolloClient, NormalizedCacheObject } from "@apollo/client/core";

interface GetServerSidePropsCallbackParameters {
  currentUser?: User | null;
  client: ApolloClient<NormalizedCacheObject>;
}
type GetServerSidePropsCallback = (params: GetServerSidePropsCallbackParameters) => Promise<GetServerSidePropsResult<{ [key: string]: any; }>>;

interface GetServerSidePropsWithAuthenticationOptions {
  callback?: GetServerSidePropsCallback;
  redirectOnAuthenticated?: boolean;
  destination?: string;
}

// TODO: Refactor as own file
const xor = (a: boolean, b: boolean) => Boolean(Number(a) ^ Number(b));

const getServerSidePropsWithAuthentication = (options: GetServerSidePropsWithAuthenticationOptions): GetServerSideProps =>
  async (context) => {
    const { callback, redirectOnAuthenticated, destination } = options;

    if (typeof context.req === 'undefined') {
      throw new Error();
    }
  
    let parsedCookies: Record<string, string>;
    if (typeof context.req.headers.cookie === 'undefined') {
      parsedCookies = {};
    } else {
      parsedCookies = cookie.parse(context.req.headers.cookie);
    }
  
    const faunaTokenManager = new FaunaTokenManager(parsedCookies);
    console.log(faunaTokenManager.get());
  
    const client = createFaunaApolloClient(faunaTokenManager.get());

    let currentUser;
    try {
      const response = await client.query<CurrentUserData>({ query });
      if (response.data.currentUser === null) {
        throw new Error('User is not authenticated.');
      }
      currentUser = response.data.currentUser;
    }
    catch (error) {
      currentUser = null;
    }

    if (xor(currentUser === null, redirectOnAuthenticated || false)) {
      return {
        redirect: {
          permanent: false,
          destination: destination || '/login'
        }
      }
    }

    if (typeof callback === 'undefined') {
      return { props: {} };
    }

    const result = await callback({ currentUser, client });
    return result;
  }

export default getServerSidePropsWithAuthentication;
