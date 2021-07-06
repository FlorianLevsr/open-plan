import { FC, useState } from 'react'
import {
  Box,
  Text,
  Flex,
  Spacer,
  Button,
  Input,
  VStack,
} from '@chakra-ui/react'
import { EditIcon } from '@chakra-ui/icons'
import { useProjectContext } from '../../data/project-by-id'
import MissionsList from './mission-list'
import AuthorizedCompaniesList from './authorized-companies-list'

interface TitleProps {
  title: string
}

const Title: FC<TitleProps> = ({ title }) => {
  return (
    <Box m="2">
      <Text
        p="2"
        fontWeight="bold"
        mr="1"
        textAlign="center"
        borderBottom="1px"
        borderColor="gray.400"
        fontSize="xl"
      >
        {title}
      </Text>
    </Box>
  )
}

interface FieldInputProps {
  label: string
  value: string | number
  variable: string
}

interface Variables {
  _id: string
  name?: string
  place?: string
  rate?: number
}

const FieldInput: FC<FieldInputProps> = ({ label, value, variable }) => {
  const { findProjectByID, actions } = useProjectContext()
  const { _id } = findProjectByID
  const [updateProject, { loading }] = actions.useUpdateProject()
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const variablesGenerator = (variable: string): Variables => {
    const variables: Variables = { _id: _id }
    switch (variable) {
      case 'name':
        variables.name = inputValue
        break
      case 'place':
        variables.place = inputValue
        break
      case 'rate':
        variables.rate = Number(inputValue)
        break
    }
    return variables
  }

  return (
    <Flex p="2" m="2">
      <Text p="2" fontWeight="bold" mr="1" w="25%">
        {label}
      </Text>
      {isOpen ? (
        <VStack w="75%">
          <form
            style={{ width: '100%' }}
            onSubmit={(e) => {
              e.preventDefault()
              updateProject({ variables: variablesGenerator(variable) })
              setInputValue('')
              setIsOpen(false)
            }}
          >
            <Input
              placeholder={`${value}`}
              p="2"
              border="1px"
              borderRadius="md"
              borderColor="gray.200"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Flex w="100%">
              <Button
                isLoading={loading}
                w="50%"
                m="1"
                bgColor="green.300"
                type="submit"
              >
                <EditIcon />
              </Button>
              <Button
                w="50%"
                m="1"
                bgColor="red.300"
                onClick={() => {
                  setIsOpen(false)
                  setInputValue('')
                }}
              >
                Cancel
              </Button>
            </Flex>
          </form>
        </VStack>
      ) : (
        <Box
          p="2"
          border="1px"
          borderRadius="md"
          borderColor="gray.200"
          w="75%"
          onClick={() => setIsOpen(true)}
        >
          <Flex>
            <Text>{typeof value === 'number' ? `${value}$` : value}</Text>
            <Spacer />
            <EditIcon />
          </Flex>
        </Box>
      )}
    </Flex>
  )
}

export const ProjectView: FC = () => {
  const { findProjectByID } = useProjectContext()
  const { name, place, rate } = findProjectByID
  return (
    <Box>
      <Title title="Project" />
      <FieldInput label="Name: " value={name} variable="name" />
      <FieldInput label="Place: " value={place} variable="place" />
      <FieldInput label="Rate: " value={rate} variable="rate" />
      <Title title="Missions" />
      <MissionsList />
      <Title title="Authorized Companies" />
      <AuthorizedCompaniesList />
    </Box>
  )
}

export default ProjectView
