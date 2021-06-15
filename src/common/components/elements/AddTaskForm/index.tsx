import React, { FC, ChangeEvent, useState, useContext } from 'react';
import { AllTasksContext } from '../../../context/AllTasksContext/index';

const AddTaskForm: FC = () => {
  const [newTaskName, setNewTaskName] = useState('');
  const { actions, loading, networkStatus } = useContext(AllTasksContext);

  return (
    <>
      {
        loading.createTaskMutationLoading ? <p>Loading...</p> :
          <form onSubmit={(event) => { event.preventDefault(); actions.createTask({ title: newTaskName }); }}>
            <input type="text" placeholder="New task name" value={newTaskName} onChange={(event: ChangeEvent<HTMLInputElement>) => setNewTaskName(event.target.value)} />
            <button type="submit" disabled={loading.createTaskMutationLoading || loading.cacheLoading }>Add</button>
          </form>
      }
    </>
  );
}

export default AddTaskForm