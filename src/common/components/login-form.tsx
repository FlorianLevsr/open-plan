import { FormControl, FormLabel } from '@chakra-ui/form-control'
import {
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Input,
  Center,
  Button,
  InputProps,
} from '@chakra-ui/react'
import React, { FC, FormEventHandler, useState } from 'react'
import { MutationResult } from 'react-apollo'

interface LoginFormProps {
  callback: (username: string, password: string) => Promise<void>
  mutationResult: MutationResult<unknown>
}

type LoginFormInputType = 'username' | 'password'

type LoginFormData = Record<LoginFormInputType, string>

interface LoginFormInputProps extends InputProps {
  label: string
  inputName: LoginFormInputType
  setProperty: (inputName: LoginFormInputType, inputValue: string) => void
}

const LoginFormInput: FC<LoginFormInputProps> = ({
  label,
  inputName,
  setProperty,
  type,
  ...rest
}) => (
  <FormLabel>
    {label}
    <Input
      {...rest}
      type={type || 'text'}
      name={inputName}
      onChange={(event) => setProperty(inputName, event.target.value)}
    />
  </FormLabel>
)

const LoginForm: FC<LoginFormProps> = ({ callback, mutationResult }) => {
  const { error, loading } = mutationResult

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  })

  const setProperty = (
    inputName: LoginFormInputType,
    inputValue: string
  ): void => {
    const newFormData = { ...formData, [inputName]: inputValue }
    setFormData(newFormData)
  }

  const onSubmitHandler: FormEventHandler = (event) => {
    event.preventDefault()
    const { username, password } = formData
    callback(username, password)
  }

  return (
    <form onSubmit={onSubmitHandler}>
      {error && (
        <Alert status="error" mr={4}>
          <AlertIcon />
          <AlertTitle mr={2}>Error:</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}
      <FormControl>
        <LoginFormInput
          label="Username"
          inputName="username"
          setProperty={setProperty}
        />
        <LoginFormInput
          label="Password"
          inputName="password"
          type="password"
          setProperty={setProperty}
        />
        <Center>
          <Button
            isLoading={loading}
            type="submit"
            colorScheme="teal"
            onClick={onSubmitHandler}
          >
            Submit
          </Button>
        </Center>
      </FormControl>
    </form>
  )
}

export default LoginForm
