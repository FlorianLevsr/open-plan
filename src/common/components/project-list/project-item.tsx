import React, { FC, useState } from 'react'
import {
  Box,
  Heading,
  Flex,
  Text,
  Button,
  Spacer,
  Modal,
  ModalHeader,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalOverlay,
} from '@chakra-ui/react'
import { useRouter } from 'next/router'
import { AddIcon } from '@chakra-ui/icons'
import { useProjectsContext } from '../../data/all-projects'

export const ProjectCreateButton: FC = () => {
  const { actions } = useProjectsContext()
  const [createProject, { loading }] = actions.useCreateProject()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [projectName, SetProjectName] = useState('')
  return (
    <>
      <Button m="2" variant="outline" leftIcon={<AddIcon />} onClick={onOpen}>
        New project
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New project</ModalHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              createProject({ variables: { name: projectName } })
              SetProjectName('')
              onClose()
            }}
          >
            <ModalBody pb={6}>
              <FormControl>
                <FormLabel>Project name</FormLabel>
                <Input
                  placeholder="Project name"
                  value={projectName}
                  onChange={(e) => SetProjectName(e.target.value)}
                />
              </FormControl>
            </ModalBody>
            <ModalFooter>
              <Button
                type="submit"
                colorScheme="teal"
                mr={3}
                isLoading={loading}
              >
                Create
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </>
  )
}

interface ProjectItemProps {
  project: {
    _id: string
    name: string
    place: string
  }
}

export const ProjectItem: FC<ProjectItemProps> = ({ project }) => {
  const router = useRouter()
  const detailsButtonHandler = (projectId: string): void => {
    router.push(`/project/${projectId}`)
  }

  return (
    <Box m="4" p="4" shadow="md" borderRadius="md">
      <Flex>
        <Box>
          <Heading fontSize="xl">{project.name}</Heading>
          <Text fontSize="xs">{project.place}</Text>
        </Box>
        <Spacer />
        <Button
          colorScheme="teal"
          onClick={() => detailsButtonHandler(project._id)}
        >
          View details
        </Button>
      </Flex>
    </Box>
  )
}
