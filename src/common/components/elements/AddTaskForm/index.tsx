import React, { FC, ChangeEvent, useState } from 'react';
import { useAllTasksContext } from '../../../context/AllTasksContext/index';

const AddTaskForm: FC = () => {
  const [newTaskName, setNewTaskName] = useState('');
  const { actions } = useAllTasksContext();
  const [createTask, { loading }] = actions.useCreateTask();

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          createTask({ variables: { title: newTaskName } });
        }}
      >
        <input
          type="text"
          disabled={loading}
          placeholder="New task name"
          value={newTaskName}
          onChange={(event: ChangeEvent<HTMLInputElement>) => setNewTaskName(event.target.value)}
        />
        <button type="submit" disabled={loading}>Add</button>
      </form>
    </>
  );
}

export default AddTaskForm