import React, { FC } from 'react';
import { AllTasksContextProvider, AllTasksData, getInitialData } from '../common/context/AllTasksContext/index';
import AddTaskForm from '../common/components/elements/AddTaskForm';
import TaskList from '../common/components/elements/task-list';
import Layout from '../common/components/layouts/Layout';
import getServerSidePropsWithAuthentication from '../common/utils/get-server-side-props-with-authentication';
import { GetServerSideProps } from 'next';

interface TasksPageProps {
  initialData: AllTasksData;
}

const TasksPage: FC<TasksPageProps> = ({ initialData }) => {
  return (
    <Layout>
      <AllTasksContextProvider initialData={initialData}>
        <TaskList />
        <AddTaskForm />
      </AllTasksContextProvider>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = getServerSidePropsWithAuthentication({
<<<<<<< HEAD
  callback: async ({ client }) => {
    const initialData = await getInitialData(client);
=======
  callback: async (currentUser) => {
    const initialData = await getInitialData(currentUser);
>>>>>>> trying to replace AllTasks query with FindUserByID, cache ko
    return { props: { initialData }};
  }
});

export default TasksPage;
