import React, { ChangeEvent, FormEvent, useState } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps, NextPage } from 'next'
import {
  FormControl,
  FormLabel,
  Button,
  Input,
  Center,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from '@chakra-ui/react'
import { Layout } from '../common/components/layouts'
import { useAuthContext } from '../common/data/auth'
import { getServerSidePropsWithAuthentication } from '../common/utils'

type LoginFormInputType = 'username' | 'password'

type LoginFormData = Record<LoginFormInputType, string>

const LoginPage: NextPage = () => {
  const router = useRouter()
  const { actions } = useAuthContext()
  const [login, { error, loading }] = actions.useLogin()
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  })
  // const [error, setError] = useState<Error | undefined>()

  const onChangeHandler = (
    inputName: LoginFormInputType,
    inputValue: string
  ): void => {
    const newFormData = { ...formData, [inputName]: inputValue }
    setFormData(newFormData)
  }

  const onSubmitHandler = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const { username, password } = formData
    try {
      await login({ variables: { username, password } })
      router.push('/tasks')
      // eslint-disable-next-line no-empty
    } catch (error) {}
  }

  return (
    <Layout>
      {error && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle mr={2}>Error:</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <form>
        <FormControl>
          <FormLabel>
            Username :
            <Input
              type="text"
              name="username"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChangeHandler('username', event.target.value)
              }
            />
          </FormLabel>
          <FormLabel>
            Password :
            <Input
              type="text"
              name="password"
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onChangeHandler('password', event.target.value)
              }
            />
          </FormLabel>
          <Center>
            <Button
              isLoading={loading}
              type="submit"
              bg="teal"
              color="white"
              onClick={(event) => onSubmitHandler(event)}
            >
              Log in
            </Button>
          </Center>
        </FormControl>
      </form>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps =
  getServerSidePropsWithAuthentication({
    redirectOnAuthenticated: true,
    destination: '/tasks',
  })

export default LoginPage
