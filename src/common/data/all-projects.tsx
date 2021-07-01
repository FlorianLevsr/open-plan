import {
  ApolloClient,
  gql,
  NormalizedCacheObject,
  TypedDocumentNode,
  useMutation,
  useQuery,
} from '@apollo/client'
import { createContext, FC } from 'react'
import { MutationFromQuery } from '../types/apollo'
import { checkDefinedNotNull } from '../utils/type-checks'

/**
 * SECTION Interfaces
 */

interface Project {
  _id: string
  name: string
}

// ANCHOR Query data structure
export interface AllProjectsData {
  allProjects: {
    data: Project[]
  }
}

// ANCHOR Create mutation return data structure
interface CreateProjectData {
  createProject: Project
}

// ANCHOR Create mutation input data structure
interface NewProjectInput {
  name: string
}

/**
 * !SECTION
 */

/**
 * SECTION GraphQL queries
 */

export const allProjectsQuery: TypedDocumentNode<AllProjectsData> = gql`
  query allProjects {
    allProjects {
      data {
        _id
        name
      }
    }
  }
`

export const createProjectQuery: TypedDocumentNode<
  CreateProjectData,
  NewProjectInput
> = gql`
  mutation createProject($name: String!) {
    createProject(input: { name: $name }) {
      _id
      name
    }
  }
`

/**
 * !SECTION
 */

// ANCHOR Initial data
export const getInitialData = async (
  client: ApolloClient<NormalizedCacheObject>
): Promise<AllProjectsData> => {
  const { data, errors } = await client.query<AllProjectsData>({
    query: allProjectsQuery,
  })
  if (errors) throw errors[0]
  return data
}

// ANCHOR Context value structure
interface ProjectsContextValue extends AllProjectsData {
  actions: {
    useCreateProject: () => MutationFromQuery<typeof createProjectQuery>
  }
}

// ANCHOR Context creation
export const ProjectsContext = createContext<ProjectsContextValue | undefined>(
  undefined
)

// ANCHOR Context provider
interface ProjectsContextProviderProps {
  initialData: AllProjectsData
}

export const ProjectsContextProvider: FC<ProjectsContextProviderProps> = ({
  children,
  initialData,
}) => {
  /**
   * SECTION Apollo hooks
   */

  const { data: queryData } = useQuery(allProjectsQuery)

  // ANCHOR Mutation which allows to create a new item
  const useCreateProject = (): MutationFromQuery<typeof createProjectQuery> =>
    useMutation(createProjectQuery, {
      update: (cache, { data }) => {
        const definedData = checkDefinedNotNull(
          data,
          'Returned data should not be null or undefined in the create task callback.'
        )
        const existingProjects = checkDefinedNotNull(
          cache.readQuery({
            query: allProjectsQuery,
          }),
          'Existing data should not be null or undefined in the create task callback.'
        )
        cache.writeQuery({
          query: allProjectsQuery,
          data: {
            allProjects: {
              data: [
                ...existingProjects.allProjects.data,
                definedData.createProject,
              ],
            },
          },
        })
      },
    })

  /**
   * !SECTION
   */

  // If query hasn't returned a result yet, use initial data
  const data = queryData || initialData

  // ANCHOR Pack data and actions to dispatch through components
  const value = {
    ...data,
    actions: {
      useCreateProject,
    },
  }

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  )
}
