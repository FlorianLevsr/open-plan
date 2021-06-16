import { FC } from 'react'
import { useAllTasksContext } from '../../context/AllTasksContext/index'
import TaskItem from './task-item'
import { List, ListItem } from '@chakra-ui/react'

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
