import { GetServerSideProps } from 'next'
import React, { FC } from 'react'
import { Layout } from '../common/components/layouts'
import { AllProjectsData, getInitialData } from '../common/data/all-projects'
import { getServerSidePropsWithAuthentication } from '../common/utils'

interface ProjectsPageProps {
  initialData: AllProjectsData
}

const ProjectsPage: FC<ProjectsPageProps> = ({ initialData }) => {
  console.log(initialData)
  return <Layout></Layout>
}

export const getServerSideProps: GetServerSideProps =
  getServerSidePropsWithAuthentication({
    callback: async ({ client }) => {
      const initialData = await getInitialData(client)
      return { props: { initialData } }
    },
  })

export default ProjectsPage
