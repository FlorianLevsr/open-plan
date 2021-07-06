import { GetServerSideProps, GetServerSidePropsResult } from 'next'
import { createFaunaApolloClient } from './fauna-apollo-client'
import FaunaTokenManager from './fauna-token-manager'
import * as cookie from 'cookie'
import { User } from '../types/fauna'
import { ApolloClient, NormalizedCacheObject } from '@apollo/client/core'
import { CurrentUserData, query } from '../data/auth'
import usersService from '../state/users'
import { checkDefined } from './type-checks'
import { ParsedUrlQuery } from 'querystring'

interface GetServerSidePropsCallbackParameters {
  client: ApolloClient<NormalizedCacheObject>
  currentUser?: User | null | undefined
  queryParam?: ParsedUrlQuery
}

type GetServerSidePropsCallback = (
  params: GetServerSidePropsCallbackParameters
) => Promise<GetServerSidePropsResult<{ [key: string]: unknown }>>

interface GetServerSidePropsWithAuthenticationOptions {
  callback?: GetServerSidePropsCallback
  redirectOnAuthenticated?: boolean
  destination?: string
}

// TODO: Refactor as own file
const xor = (a: boolean, b: boolean): boolean => Boolean(Number(a) ^ Number(b))

const getServerSidePropsWithAuthentication =
  (options: GetServerSidePropsWithAuthenticationOptions): GetServerSideProps =>
  async (context) => {
    const { callback, redirectOnAuthenticated, destination } = options

    if (typeof context.req === 'undefined') {
      throw new Error()
    }

    let parsedCookies: Record<string, string>
    if (typeof context.req.headers.cookie === 'undefined') {
      parsedCookies = {}
    } else {
      parsedCookies = cookie.parse(context.req.headers.cookie)
    }

    const faunaTokenManager = new FaunaTokenManager(parsedCookies)
    const token = faunaTokenManager.get()

    const client = createFaunaApolloClient(token)

    let currentUser = usersService.get(token) || null

    // in case a query param is found
    let queryParam = context.query
    if (typeof context.query === undefined) queryParam = {}

    if (
      token !== process.env.NEXT_PUBLIC_FAUNA_SECRET &&
      currentUser === null
    ) {
      try {
        const response = await client.query<CurrentUserData>({ query })
        const definedUser = checkDefined(response.data.currentUser)
        if (definedUser === null) {
          throw new Error('User is not authenticated.')
        }
        currentUser = definedUser
      } catch (error) {
        currentUser = null
      }
    }

    if (xor(currentUser === null, redirectOnAuthenticated || false)) {
      return {
        redirect: {
          permanent: false,
          destination: destination || '/login',
        },
      }
    }

    if (typeof callback === 'undefined') {
      return { props: {} }
    }

    const result = await callback({ currentUser, client, queryParam })
    return result
  }

export default getServerSidePropsWithAuthentication
