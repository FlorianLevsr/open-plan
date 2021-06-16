import React, { FC } from 'react'
import {
  AllTasksContextProvider,
  TasksByUserData,
  getInitialData,
} from '../common/context/AllTasksContext/index'
import AddTaskForm from '../common/components/elements/AddTaskForm'
import TaskList from '../common/components/elements/task-list'
import Layout from '../common/components/layouts/Layout'
import getServerSidePropsWithAuthentication from '../common/utils/get-server-side-props-with-authentication'
import { GetServerSideProps } from 'next'
import { User } from '../common/types/fauna'

interface TasksPageProps {
  initialData: TasksByUserData
  currentUser: User
}

const TasksPage: FC<TasksPageProps> = ({ initialData, currentUser }) => {
  return (
    <Layout>
      <AllTasksContextProvider
        initialData={initialData}
        currentUser={currentUser}
      >
        <TaskList />
        <AddTaskForm />
      </AllTasksContextProvider>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps =
  getServerSidePropsWithAuthentication({
    callback: async ({ client, currentUser }) => {
      const initialData = await getInitialData(client, currentUser)
      return { props: { initialData, currentUser } }
    },
  })

export default TasksPage
