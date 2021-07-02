import { GetServerSideProps } from 'next'
import React, { FC } from 'react'
import { Layout } from '../common/components/layouts'
import { AllProjectsData, getInitialData } from '../common/data/all-projects'
import { getServerSidePropsWithAuthentication } from '../common/utils'
import { ProjectsContextProvider } from '../common/data/all-projects'
import ProjectList from '../common/components/project-list'
import { User } from '../common/types/fauna'

interface ProjectsPageProps {
  initialData: AllProjectsData
  currentUser: User
}

const ProjectsPage: FC<ProjectsPageProps> = ({ initialData, currentUser }) => {
  return (
    <Layout>
      <ProjectsContextProvider
        initialData={initialData}
        currentUser={currentUser}
      >
        <ProjectList />
      </ProjectsContextProvider>
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

export default ProjectsPage
