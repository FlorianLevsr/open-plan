import { GetServerSideProps } from 'next'
import React, { FC } from 'react'
import { Layout } from '../../common/components/layouts'
import { getInitialData, ProjectData } from '../../common/data/project-by-id'
import { getServerSidePropsWithAuthentication } from '../../common/utils'
import ProjectView from '../../common/components/project-view'
import { ProjectContextProvider } from '../../common/data/project-by-id'

interface ProjectPageProps {
  initialData: ProjectData
}

const ProjectPage: FC<ProjectPageProps> = ({ initialData }) => {
  return (
    <Layout>
      <ProjectContextProvider initialData={initialData}>
        <ProjectView />
      </ProjectContextProvider>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps =
  getServerSidePropsWithAuthentication({
    callback: async ({ client, queryParam }) => {
      const initialData = await getInitialData(client, queryParam?.id)
      return { props: { initialData } }
    },
  })

export default ProjectPage
