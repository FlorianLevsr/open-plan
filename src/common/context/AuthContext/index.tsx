import React from 'react'
import { ApolloError, gql } from '@apollo/client/core';
import { useMutation, useQuery } from '@apollo/client/react';
import { useRouter } from 'next/router';
import { createContext, FC } from "react";
import { User } from "../../types/fauna";
import { FaunaTokenManager } from '../../utils';

export interface CurrentUserData {
  currentUser?: User | null;
}

interface LoginData {
  loginUser: string;
}

interface LoginInput {
  username: string;
  password: string;
}

export const query = gql`
  query CurrentUserQuery {
    currentUser {
      _id
      username
    }
  }
`;

export const loginQuery = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(input: {
      username: $username,
      password: $password
    })
  }
`;

const logoutQuery = gql`
  mutation LogoutUser {
    logoutUser
  }
`;

interface AuthContextValue extends CurrentUserData {
  states: {
    loading: boolean
  };
  actions: {
    login: (username: string, password: string) => void;
    logout: () => void;
  }
}

// creation du context + initial state
export const AuthContext = createContext<AuthContextValue>({
  currentUser: { _id: '', _ts: 0, username: '', tasks: [] },
  states: {
    loading: false
  },
  actions: {
    login: () => undefined,
    logout: () => undefined
  }
});

// creation du provider
export const AuthContextProvider: FC = ({ children }) => {
  const faunaTokenManager = new FaunaTokenManager();
  const { loading, error, data, refetch } = useQuery<CurrentUserData>(query, { errorPolicy: 'all' });

  const router = useRouter();

  const [loginMutation] = useMutation<LoginData, LoginInput>(loginQuery, {
    onCompleted: (data) => {
      faunaTokenManager.set(data.loginUser);
      refetch();
    },
  });

  const [logoutMutation] = useMutation(logoutQuery, {
    onCompleted: () => {
      faunaTokenManager.reset();
      refetch();
    },
  });

  let value = {
    states: {
      loading,
    },
    actions: {
      login: (username: string, password: string) => loginMutation({ variables: { username, password } }),
      logout: () => {
        logoutMutation();
        router.push('/');
      }
    }
  }


  if (typeof data !== 'undefined') {
    value = { ...value, ...data };
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}