import React, { FormEvent, useContext, useState } from 'react';
import { AuthContext } from '../common/context/AuthContext';
import { useRouter } from 'next/router';
import Layout from '../common/components/layouts/Layout';
import { GetServerSideProps } from 'next';
import getServerSidePropsWithAuthentication from '../common/utils/get-server-side-props-with-authentication';

const LoginPage = () => {
  const router = useRouter();
  const { actions } = useContext(AuthContext);
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
      <p>Login</p>
      <form onSubmit={(event) => onSubmitHandler(event)}>
        <label>
          Username :
        <input type="text" name="username" onChange={(event) => onchangeHandler(event.target.name, event.target.value)} />
        </label>
        <label>
          Password :
        <input type="text" name="password" onChange={(event) => onchangeHandler(event.target.name, event.target.value)} />
        </label>
        <input type="submit" value="Envoyer" />
      </form>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = getServerSidePropsWithAuthentication({
  redirectOnAuthenticated: true,
  destination: '/tasks',
});

export default LoginPage;
