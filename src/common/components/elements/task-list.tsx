import { FC, useContext } from "react";
import { AllTasksContext } from "../../context/AllTasksContext/index";
import TaskItem from "./task-item";
import { List, ListItem, ListIcon, OrderedList, UnorderedList } from "@chakra-ui/react"

const TaskList: FC = () => {

  const { findUserByID } = useContext(AllTasksContext)

  return (
    <List>
      {findUserByID && findUserByID.tasks.data.map(
        task =>
          <ListItem key={task._id}>
            <TaskItem task={task} />
          </ListItem>
      )}
    </List>
  );
}

export default TaskList;
