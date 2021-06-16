import React, { FC } from 'react'
import { List, ListItem } from '@chakra-ui/react'
import { useAllTasksContext } from '../../data/all-tasks'
import TaskItem from './task-item'

const TaskList: FC = () => {
  const { findUserByID } = useAllTasksContext()

  return (
    <List>
      {findUserByID &&
        findUserByID.tasks.data.map((task) => (
          <ListItem key={task._id}>
            <TaskItem task={task} />
          </ListItem>
        ))}
    </List>
  )
}

export default TaskList
