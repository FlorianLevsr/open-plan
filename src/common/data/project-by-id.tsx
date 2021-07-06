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
import { checkDefined, checkDefinedNotNull } from '../utils/type-checks'

interface Project {
  _id: string
  name: string
  place: string
  rate: number
  authorizedCompanies: authorizedCompaniesData
  missions: MissionData
}

interface authorizedCompaniesData {
  data: AuthorizedCompany[]
}

interface AuthorizedCompany {
  _id: string
  name: string
}

interface MissionData {
  data: Mission[]
}

interface Mission {
  _id: string
  name: string
}

// ANCHOR Query data structure
export interface ProjectData {
  findProjectByID: Project
}

// ANCHOR Update project mutation return data structure
interface UpdateProjectData {
  updateProject: Project
}

interface UpdateProjectDataInput {
  _id: string
  name?: string
  place?: string
  rate?: number
}

export const projectQuery: TypedDocumentNode<ProjectData> = gql`
  query ProjectByID($_id: ID!) {
    findProjectByID(id: $_id) {
      _id
      name
      place
      rate
      authorizedCompanies {
        data {
          _id
          name
        }
      }
      missions {
        data {
          _id
          name
        }
      }
    }
  }
`

export const updateProjectQuery: TypedDocumentNode<
  UpdateProjectData,
  UpdateProjectDataInput
> = gql`
  mutation updateProject($_id: ID!, $name: String, $place: String, $rate: Int) {
    updateProject(id: $_id, data: { name: $name, place: $place, rate: $rate }) {
      _id
      name
      place
      rate
      authorizedCompanies {
        data {
          _id
          name
        }
      }
      missions {
        data {
          _id
          name
        }
      }
    }
  }
`

// ANCHOR Initial data
export const getInitialData = async (
  client: ApolloClient<NormalizedCacheObject>,
  id: string | string[] | undefined | null
): Promise<ProjectData> => {
  if (typeof id !== undefined) {
    const { data, errors } = await client.query<ProjectData>({
      query: projectQuery,
      variables: { _id: id },
    })
    if (errors) throw errors[0]
    return data
  }
  throw new Error('No project id specified')
}

interface ProjectContextValue extends ProjectData {
  actions: {
    useUpdateProject: () => MutationFromQuery<typeof updateProjectQuery>
  }
}

// ANCHOR Context creation
export const ProjectContext = createContext<ProjectContextValue | undefined>(
  undefined
)

// ANCHOR Use Context hook
export const useProjectContext = (): ProjectContextValue =>
  checkDefined(
    useContext(ProjectContext),
    'ProjectContext should not be undefined. Did you forget to wrap your component inside a Provider?'
  )

// ANCHOR Context provider
interface ProjectContextProviderProps {
  initialData: ProjectData
}

export const ProjectContextProvider: FC<ProjectContextProviderProps> = ({
  children,
  initialData,
}) => {
  const _id = initialData.findProjectByID._id
  const { data: queryData } = useQuery(projectQuery, { variables: { _id } })

  // If query hasn't returned a result yet, use initial data
  const data = queryData || initialData

  // ANCHOR Mutation which allows to update a project
  const useUpdateProject = (): MutationFromQuery<typeof updateProjectQuery> =>
    useMutation(updateProjectQuery, {
      update: (cache, { data }) => {
        const definedData = checkDefinedNotNull(
          data,
          'Returned data should not be null or undefined in the update project callback.'
        )
        const existingProject = checkDefinedNotNull(
          cache.readQuery({
            query: projectQuery,
            variables: { _id },
          }),
          'Existing data should not be null or undefined in the cache.'
        )
        cache.writeQuery({
          query: projectQuery,
          variables: { _id },
          data: {
            findProjectByID: {
              ...existingProject.findProjectByID,
              ...definedData.updateProject,
            },
          },
        })
      },
    })

  // ANCHOR Pack data and actions to dispatch through components
  const value = {
    ...data,
    actions: {
      useUpdateProject,
    },
  }

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  )
}
