import { FC, useState } from "react";
import { useAllTasksContext } from "../../context/AllTasksContext/index";
import { Task } from "../../types/fauna";

interface TaskItemProps {
  task: Task;
}

const DeleteTaskItemButton: FC<TaskItemProps> = ({ task }) => {
  const { actions } = useAllTasksContext();
  const [deleteTask, { loading }] = actions.useDeleteTask();

  return (
    <button
      disabled={loading}
      onClick={() => deleteTask({ variables: { _id: task._id } })}
    >
      Remove
    </button>
  );
}

const UpdateTaskCompletedItemButton: FC<TaskItemProps> = ({ task }) => {
  const { actions } = useAllTasksContext();
  const [updateTaskCompleted, { loading }] = actions.useUpdateTaskCompleted();

  return (
    <button
      disabled={loading}
      onClick={() => updateTaskCompleted({ variables: { _id: task._id, completed: !task.completed } })}
    >
      {task.completed ? "Undo" : "Complete"}
    </button>
  );
}

const RenameTaskItemButton: FC<TaskItemProps> = ({ task }) => {
  const { actions } = useAllTasksContext();
  const [updateTaskTitle, { loading }] = actions.useUpdateTaskTitle();
  const [renameInput, setRenameInput] = useState<string>("")

  const onChangeHandler = (inputvalue: string) => {
    setRenameInput(inputvalue)
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        updateTaskTitle({variables: {_id: task._id, title: renameInput }}); 
        setRenameInput("");
      }}
    >
      <p>Rename task:</p>
      <input type="text" value={renameInput} placeholder={task.title} onChange={(event) => onChangeHandler(event.target.value)}></input>
      <button type="submit" disabled={loading}>Rename</button>
    </form>
  );
}

const TaskItem: FC<TaskItemProps> = ({ task }) => {
  const { actions, loading } = useAllTasksContext();

  return (
    <>
      <h3>
        {task.title}
      </h3>
      <div>
        <DeleteTaskItemButton task={task} />
        <UpdateTaskCompletedItemButton task={task} />
        <RenameTaskItemButton task={task} />
      </div>
    </>
  )
}

export default TaskItem;
