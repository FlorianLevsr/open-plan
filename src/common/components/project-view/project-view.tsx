import { FC } from 'react'
import { Box } from '@chakra-ui/react'
import { useProjectContext } from '../../data/project-by-id'
import MissionsList from './mission-list'
import AuthorizedCompaniesList from './authorized-companies-list'
import FieldInput from './field-input'
import Title from './title'

export const ProjectView: FC = () => {
  const { findProjectByID } = useProjectContext()
  const { name, place, rate } = findProjectByID
  return (
    <Box>
      <Title title="Project" />
      <FieldInput label="Name: " value={name} variable="name" />
      <FieldInput label="Place: " value={place} variable="place" />
      <FieldInput label="Rate: " value={rate} variable="rate" />
      <Title title="Missions" />
      <MissionsList />
      <Title title="Authorized Companies" />
      <AuthorizedCompaniesList />
    </Box>
  )
}

export default ProjectView
