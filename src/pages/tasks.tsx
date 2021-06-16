import React from 'react'
import { GetServerSideProps, NextPage } from 'next'
import { User } from '../common/types/fauna'
import { TaskList, AddTaskForm } from '../common/components'
import { Layout } from '../common/components/layouts'
import {
  TasksByUserData,
  AllTasksContextProvider,
  getInitialData,
} from '../common/data/all-tasks'
import { getServerSidePropsWithAuthentication } from '../common/utils'

interface TasksPageProps {
  initialData: TasksByUserData
  currentUser: User
}

const TasksPage: NextPage<TasksPageProps> = ({ initialData, currentUser }) => {
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
