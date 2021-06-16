import React, { FC, ChangeEvent, useState } from 'react'
import { FormControl, Input, Button, Box, HStack } from '@chakra-ui/react'
import { SmallAddIcon } from '@chakra-ui/icons'
import { useAllTasksContext } from '../data/all-tasks'

const AddTaskForm: FC = () => {
  const [newTaskName, setNewTaskName] = useState('')
  const { actions } = useAllTasksContext()
  const [createTask, { loading }] = actions.useCreateTask()

  return (
    <Box m="2">
      <form>
        <FormControl p="2">
          <HStack>
            <Input
              type="text"
              disabled={loading}
              placeholder="New task name"
              value={newTaskName}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                setNewTaskName(event.target.value)
              }
            />
            <Button
              type="submit"
              disabled={loading}
              onClick={(event) => {
                event.preventDefault()
                createTask({ variables: { title: newTaskName } })
              }}
            >
              <SmallAddIcon />
            </Button>
          </HStack>
        </FormControl>
      </form>
    </Box>
  )
}

export default AddTaskForm
