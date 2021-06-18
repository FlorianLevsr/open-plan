import { Text, Box, Spinner, VStack } from "@chakra-ui/react"
import { FC } from "react";

const PageLoader: FC = () => {
  return (
    <Box className="loader_blur">
        <VStack>
          <Text fontSize="xl" mt="45vh" >Loading...</Text>
          <Spinner
            thickness="4px"
            speed="0.65s"
            emptyColor="gray.200"
            color="teal"
            size="xl"
          />
        </VStack>
    </Box>

  );
}

export default PageLoader