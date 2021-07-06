import { FC } from 'react'
import { Box, Text } from '@chakra-ui/react'

interface TitleProps {
  title: string
}

const Title: FC<TitleProps> = ({ title }) => {
  return (
    <Box m="2">
      <Text
        p="2"
        fontWeight="bold"
        mr="1"
        textAlign="center"
        borderBottom="1px"
        borderColor="gray.400"
        fontSize="xl"
      >
        {title}
      </Text>
    </Box>
  )
}

export default Title
