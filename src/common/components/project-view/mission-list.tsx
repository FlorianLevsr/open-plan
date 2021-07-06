import { FC } from 'react'
import { Box, Text, Flex, Spacer, Button } from '@chakra-ui/react'
import { useProjectContext } from '../../data/project-by-id'

const MissionsList: FC = () => {
  const { findProjectByID } = useProjectContext()
  const { missions } = findProjectByID
  return (
    <>
      {missions.data &&
        missions.data.map((mission) => {
          return (
            <Box m="4" p="4" shadow="md" borderRadius="md" key={mission._id}>
              <Flex>
                <Box>
                  <Text>{mission.name}</Text>
                </Box>
                <Spacer />
                <Button colorScheme="teal">View details</Button>
              </Flex>
            </Box>
          )
        })}
    </>
  )
}

export default MissionsList
