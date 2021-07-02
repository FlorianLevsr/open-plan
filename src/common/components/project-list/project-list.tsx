import React, { FC } from 'react'
import { List, ListItem, Center } from '@chakra-ui/react'
import { useProjectsContext } from '../../data/all-projects'
import { ProjectItem, ProjectCreateButton } from './project-item'

const ProjectList: FC = () => {
  const { findUserByID } = useProjectsContext()
  return (
    <>
      <List>
        {findUserByID &&
          findUserByID.company.projects.data.map((project) => (
            <ListItem key={project._id}>
              <ProjectItem project={project} />
            </ListItem>
          ))}
      </List>
      <Center>
        <ProjectCreateButton />
      </Center>
    </>
  )
}

export default ProjectList
