import { FC, useContext, useState } from "react";
import { AllTasksContext } from "../../context/AllTasksContext/index";
import { Task } from "../../types/fauna";

interface TaskItemProps {
  task: Task;
}

const TaskItem: FC<TaskItemProps> = ({ task }) => {
  const { actions } = useContext(AllTasksContext);

  const [renameInput, setRenameInput] = useState<string>("")

  const onChangeHandler = (inputvalue: string) => {
    setRenameInput(inputvalue)
  }

  return (
    <>
      <h3>
        {task.title}
      </h3>
      {task.completed ? 'done' : 'to do'}
      <div>
        <button onClick={() => actions.deleteTask(task._id)}>Remove</button>
        <button onClick={() => actions.updateTaskCompleted(task._id, !task.completed)}>{task.completed ? "Undo" : "Complete"}</button>
        <div>
          <p>Rename task:</p>
          <input type="text" value={renameInput} placeholder={task.title} onChange={(event) => onChangeHandler(event.target.value)}></input>
          <button onClick={() => { actions.updateTaskTitle(task._id, renameInput); setRenameInput(""); }}>Rename</button>
        </div>
        
      </div>
    </>
  )
}

export default TaskItem;
