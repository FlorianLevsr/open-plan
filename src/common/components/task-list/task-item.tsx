import React, { ChangeEvent, MouseEvent, FC, useState } from 'react'
import { Task } from '../../types/fauna'
import {
  FormControl,
  Button,
  Input,
  Box,
  HStack,
  Flex,
  Text,
  Spacer,
} from '@chakra-ui/react'
import {
  CheckIcon,
  SmallCloseIcon,
  DeleteIcon,
  EditIcon,
} from '@chakra-ui/icons'
import { ReactNode } from 'react'
import { useAllTasksContext } from '../../data/all-tasks'

interface TaskItemProps {
  task: Task
}

export const DeleteTaskItemButton: FC<TaskItemProps> = ({ task }) => {
  const { actions } = useAllTasksContext()
  const [deleteTask, { loading }] = actions.useDeleteTask()

  return (
    <Button
      size="sm"
      ml="2"
      bg="gray.300"
      onClick={() => deleteTask({ variables: { _id: task._id } })}
      isLoading={loading}
    >
      <DeleteIcon />
    </Button>
  )
}

export const UpdateTaskCompletedItemButton: FC<TaskItemProps> = ({ task }) => {
  const { actions } = useAllTasksContext()
  const [updateTaskCompleted, { loading }] = actions.useUpdateTaskCompleted()

  const makeButtonContent = (completed?: boolean): ReactNode => {
    if (completed) {
      return (
        <>
          <CheckIcon />
          <Text ml="2">Done</Text>
        </>
      )
    }

    return (
      <>
        <SmallCloseIcon />
        <Text ml="2">To do</Text>
      </>
    )
  }

  return (
    <Button
      size="sm"
      ml="2"
      bg={task.completed ? 'green.300' : 'red.300'}
      onClick={() =>
        updateTaskCompleted({
          variables: { _id: task._id, completed: !task.completed },
        })
      }
      isLoading={loading}
    >
      {makeButtonContent(task.completed)}
    </Button>
  )
}

interface TaskItemWithHandlerProps {
  task: Task
  onClickHandler: (state: boolean) => void
}

export const RenameTaskItemButton: FC<TaskItemWithHandlerProps> = ({
  task,
  onClickHandler,
}) => {
  const { actions } = useAllTasksContext()
  const [updateTaskTitle, { loading }] = actions.useUpdateTaskTitle()
  const [renameInput, setRenameInput] = useState<string>(task.title)
  const onChangeHandler = (inputvalue: string): void => {
    setRenameInput(inputvalue)
  }

  return (
    <FormControl>
      <HStack>
        <Input
          size="sm"
          type="text"
          value={renameInput}
          placeholder="New name"
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onChangeHandler(event.target.value)
          }
        ></Input>
        <Button
          size="sm"
          borderRadius="md"
          type="submit"
          isLoading={loading}
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault()
            updateTaskTitle({
              variables: { _id: task._id, title: renameInput },
            })
            setRenameInput('')
            onClickHandler(false)
          }}
        >
          <EditIcon />
        </Button>
      </HStack>
    </FormControl>
  )
}

const TaskItem: FC<TaskItemProps> = ({ task }) => {
  const [isOpen, setIsOpen] = useState(false)
  const onClickHandler = (state: boolean): void => {
    setIsOpen(state)
  }

  return (
    <Box m="4" p="4" shadow="md" borderRadius="md">
      <Flex>
        {isOpen ? (
          <>
            <RenameTaskItemButton task={task} onClickHandler={onClickHandler} />
            <Button
              size="sm"
              bg="red.300"
              ml="2"
              onClick={() => onClickHandler(false)}
            >
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Text fontSize="xl" onDoubleClick={() => onClickHandler(true)}>
              {task.title}
            </Text>
            <Spacer />
            <UpdateTaskCompletedItemButton task={task} />
            <DeleteTaskItemButton task={task} />
          </>
        )}
      </Flex>
    </Box>
  )
}

export default TaskItem
