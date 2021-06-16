import React, { ChangeEvent, FormEvent, useContext, useState } from 'react'
import { AuthContext } from '../common/context/AuthContext'
import { useRouter } from 'next/router'
import Layout from '../common/components/layouts/Layout'
import { GetServerSideProps, NextPage } from 'next'
import getServerSidePropsWithAuthentication from '../common/utils/get-server-side-props-with-authentication'
import { FormControl, FormLabel, Button, Input, Center } from '@chakra-ui/react'

type FormInput = 'username' | 'password'

const LoginPage: NextPage = () => {
  const router = useRouter()
  const { actions } = useContext(AuthContext)
  const [formData, setFormData] = useState({ username: '', password: '' })

  const onChangeHandler = (inputName: FormInput, inputValue: string): void => {
    const newFormData = { ...formData, [inputName]: inputValue }
    setFormData(newFormData)
  }

  const onSubmitHandler = async (event: FormEvent): Promise<void> => {
    event.preventDefault()
    const { username, password } = formData
    await actions.login(username, password)
    router.push('/tasks')
  }

  return (
    <Layout>
      <form></form>
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
            bg="teal"
            color="white"
            onClick={(event: FormEvent) => onSubmitHandler(event)}
          >
            Log in
          </Button>
        </Center>
      </FormControl>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps =
  getServerSidePropsWithAuthentication({
    redirectOnAuthenticated: true,
    destination: '/tasks',
  })

export default LoginPage
