import { GetServerSideProps, GetServerSidePropsResult } from "next";
import { createFaunaApolloClient } from "./fauna-apollo-client";
import { CurrentUserData, query } from "../context/AuthContext";
import FaunaTokenManager from "./fauna-token-manager";
import * as cookie from 'cookie';
import { User } from "../types/fauna";

type GetServerSidePropsCallback = (currentUser: User | undefined) => Promise<GetServerSidePropsResult<{ [key: string]: any; }>>;

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
  
    const client = createFaunaApolloClient(faunaTokenManager.get());
    const response = await client.query<CurrentUserData>({ query });

    if (xor(response.data.currentUser === null, redirectOnAuthenticated || false)) {
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

    const result = await callback(response.data.currentUser);
    return result;
  }

export default getServerSidePropsWithAuthentication;
