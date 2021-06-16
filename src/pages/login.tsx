import React, { FormEvent, useContext, useState } from 'react';
import { AuthContext } from '../common/context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../common/components/layouts/Layout';
import { GetServerSideProps } from 'next';
import getServerSidePropsWithAuthentication from '../common/utils/get-server-side-props-with-authentication';
import { FormControl, FormLabel, Button, Input, Center } from "@chakra-ui/react"


const LoginPage = () => {
  const router = useRouter();
  const { actions, states } = useContext(AuthContext);
  const [formData, setFormData] = useState({ username: '', password: '' });

  const onchangeHandler = (inputName: string, inputValue: string) => {
    const newFormData = { ...formData, [inputName]: inputValue }
    setFormData(newFormData)
  };

  const onSubmitHandler = async (event: FormEvent) => {
    event.preventDefault();
    const { username, password } = formData;
    await actions.login(username, password);
    router.push('/tasks');
  };

  return (
    <Layout>
      <form>
      <FormControl>
        <FormLabel>
          Username :
          <Input type="text" name="username" onChange={(event) => onchangeHandler(event.target.name, event.target.value)} />
        </FormLabel>
        <FormLabel>
          Password :
          <Input type="text" name="password" onChange={(event) => onchangeHandler(event.target.name, event.target.value)} />
        </FormLabel>
        <Center>
          <Button isLoading={states.mutationLoading} type="submit" bg="teal" color="white" onClick={(event) => onSubmitHandler(event)} >Log in</Button>
        </Center>
      </FormControl>
      </form>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = getServerSidePropsWithAuthentication({
  redirectOnAuthenticated: true,
  destination: '/tasks',
});

export default LoginPage;
