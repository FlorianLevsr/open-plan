import React from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps, NextPage } from 'next'
import { Layout } from '../common/components/layouts'
import { useAuthContext } from '../common/data/auth'
import { getServerSidePropsWithAuthentication } from '../common/utils'
import { LoginForm } from '../common/components'
import { Heading } from '@chakra-ui/react'

const SignupPage: NextPage = () => {
  const router = useRouter()
  const { actions } = useAuthContext()
  const [signup, mutationResult] = actions.useSignup()

  const callback = async (
    username: string,
    password: string
  ): Promise<void> => {
    try {
      await signup({ variables: { username, password } })
      router.push('/tasks')
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  return (
    <Layout>
      <Heading as="h1" mb={6}>
        Sign up
      </Heading>
      <LoginForm callback={callback} mutationResult={mutationResult} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps =
  getServerSidePropsWithAuthentication({
    redirectOnAuthenticated: true,
    destination: '/tasks',
  })

export default SignupPage
