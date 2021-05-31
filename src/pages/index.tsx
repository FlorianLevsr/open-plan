import React, { FC } from 'react';
import { GetServerSideProps } from 'next'
import { AllTasksContextProvider, AllTasksData, fetcher, query } from '../common/context/AllTasksContext/index';
import AddTaskForm from '../common/components/elements/AddTaskForm';

interface IndexPageProps {
  initialData: AllTasksData;
}

const IndexPage: FC<IndexPageProps> = ({ initialData }) => {
  return (
      <AllTasksContextProvider initialData={initialData}>
        {({ allTasks, actions }) =>
          <>
            { <><h1>Task list</h1>
            <ul>
              {allTasks.data.map(
                task =>
                  <li key={task._id}>
                    <h3>
                      {task.title}
                    </h3>
                    {task.completed ? 'done' : 'to do'}
                    <div>
                      <button onClick={() => actions.deleteTask(task._id)}>Remove</button>
                      <button onClick={() => actions.updateTask(task._id, { ...task, completed: !task.completed })}>{task.completed ? "Undo" : "Complete"}</button>
                    </div>
                  </li>
              )}
            </ul></>}
            <AddTaskForm />
          </>
        }
      </AllTasksContextProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const initialData = await fetcher()(query);
  return { props: { initialData } };
}

export default IndexPage
