import { FC, useContext } from "react";
import { AllTasksContext } from "../../context/AllTasksContext/index";
import TaskItem from "./task-item";

const TaskList: FC = () => {

  const { findUserByID } = useContext(AllTasksContext)

  return (
    <ul>
      {findUserByID.tasks.data.map(
        task =>
          <li key={task._id}>
            <TaskItem task={task} />
          </li>
      )}
    </ul>
  );
}

export default TaskList;
