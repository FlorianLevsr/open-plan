import { FC } from 'react'
import { Box, Text, Flex, Spacer, Button } from '@chakra-ui/react'
import { useProjectContext } from '../../data/project-by-id'

const AuthorizedCompaniesList: FC = () => {
  const { findProjectByID } = useProjectContext()
  const { authorizedCompanies } = findProjectByID
  return (
    <>
      {authorizedCompanies.data &&
        authorizedCompanies.data.map((company) => {
          return (
            <Box m="4" p="4" shadow="md" borderRadius="md" key={company._id}>
              <Flex>
                <Box>
                  <Text>{company.name}</Text>
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

export default AuthorizedCompaniesList
