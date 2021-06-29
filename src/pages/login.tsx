import React from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps, NextPage } from 'next'
import { Layout } from '../common/components/layouts'
import { useAuthContext } from '../common/data/auth'
import { getServerSidePropsWithAuthentication } from '../common/utils'
import { LoginForm } from '../common/components'

const LoginPage: NextPage = () => {
  const router = useRouter()
  const { actions } = useAuthContext()
  const [login, mutationResult] = actions.useLogin()

  const callback = async (
    username: string,
    password: string
  ): Promise<void> => {
    try {
      await login({ variables: { username, password } })
      router.push('/tasks')
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  return (
    <Layout>
      <LoginForm callback={callback} mutationResult={mutationResult} />
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps =
  getServerSidePropsWithAuthentication({
    redirectOnAuthenticated: true,
    destination: '/tasks',
  })

export default LoginPage
