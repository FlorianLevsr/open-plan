import {
  ApolloClient,
  gql,
  NormalizedCacheObject,
  TypedDocumentNode,
  useMutation,
  useQuery,
} from '@apollo/client'
import { createContext, FC, useContext } from 'react'
import { MutationFromQuery } from '../types/apollo'
import { User } from '../types/fauna'
import { checkDefined, checkDefinedNotNull } from '../utils/type-checks'

/**
 * SECTION Interfaces
 */

interface Project {
  _id: string
  name: string
  place: string
}

// ANCHOR Query data structure
export interface AllProjectsData {
  findUserByID: {
    _id: string
    company: {
      projects: {
        data: Project[]
      }
    }
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
  query FindUserByID($_id: ID!) {
    findUserByID(id: $_id) {
      _id
      company {
        projects {
          data {
            _id
            name
            place
          }
        }
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
  client: ApolloClient<NormalizedCacheObject>,
  currentUser: User | undefined | null
): Promise<AllProjectsData> => {
  if (typeof currentUser !== undefined) {
    const { data, errors } = await client.query<AllProjectsData>({
      query: allProjectsQuery,
      variables: { _id: currentUser?._id },
    })
    if (errors) throw errors[0]
    return data
  }
  throw new Error('No user found')
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

// ANCHOR Use Context hook
export const useProjectsContext = (): ProjectsContextValue =>
  checkDefined(
    useContext(ProjectsContext),
    'ProjectsContext should not be undefined. Did you forget yo wrap your component inside a Provider?'
  )

// ANCHOR Context provider
interface ProjectsContextProviderProps {
  initialData: AllProjectsData
  currentUser: User
}

export const ProjectsContextProvider: FC<ProjectsContextProviderProps> = ({
  children,
  initialData,
  currentUser,
}) => {
  /**
   * SECTION Apollo hooks
   */
  const _id = currentUser._id
  const { data: queryData } = useQuery(allProjectsQuery, { variables: { _id } })

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
            variables: { _id },
          }),
          'Existing data should not be null or undefined in the create task callback.'
        )
        cache.writeQuery({
          query: allProjectsQuery,
          variables: { _id },
          data: {
            findUserByID: {
              _id,
              company: {
                projects: {
                  data: [
                    ...existingProjects.findUserByID.company.projects.data,
                    definedData.createProject,
                  ],
                },
              },
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
