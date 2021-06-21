import React, { createContext, FC, useContext } from 'react'
import {
  gql,
  useQuery,
  useMutation,
  ApolloClient,
  NormalizedCacheObject,
  TypedDocumentNode,
} from '@apollo/client'
import { FaunaId, Task, User } from '../types/fauna'
import { ExistingTaskInput, NewTaskInput } from '../types/fauna'
import { checkDefined, checkDefinedNotNull } from '../utils/type-checks'
import { MutationFromQuery } from '../types/apollo'

/**
 * SECTION Interfaces
 */

// ANCHOR Query data structure
export interface TasksByUserData {
  findUserByID: {
    _id: string
    tasks: {
      data: Task[]
    }
  }
}

// ANCHOR Create mutation return data structure
interface CreateTaskData {
  createTask: Task
}

// ANCHOR Update title mutation return data structure
interface UpdateTaskTitleData {
  updateTaskTitle: Task
}

// ANCHOR Update completed mutation return data structure
interface UpdateTaskCompletedData {
  updateTaskCompleted: Task
}

// ANCHOR Delete mutation return data structure
interface DeleteTaskData {
  deleteTask: FaunaId
}
/**
 * !SECTION
 */

/**
 * SECTION GraphQL queries
 */

// ANCHOR Describe query
export const query: TypedDocumentNode<TasksByUserData, FaunaId> = gql`
  query FindUserByID($_id: ID!) {
    findUserByID(id: $_id) {
      _id
      tasks {
        data {
          _id
          title
          completed
        }
      }
    }
  }
`

// ANCHOR Describe create query
export const createQuery: TypedDocumentNode<CreateTaskData, NewTaskInput> = gql`
  mutation createTask($title: String!) {
    createTask(input: { title: $title }) {
      _id
      title
      completed
    }
  }
`

// ANCHOR Describe update task title query
export const updateTitleQuery: TypedDocumentNode<
  UpdateTaskTitleData,
  ExistingTaskInput
> = gql`
  mutation updateTaskTitle($_id: ID!, $title: String!) {
    updateTaskTitle(input: { id: $_id, title: $title }) {
      _id
      title
      completed
    }
  }
`

// ANCHOR Describe update task completed query
export const updateCompletedQuery: TypedDocumentNode<
  UpdateTaskCompletedData,
  ExistingTaskInput
> = gql`
  mutation updateTaskCompleted($_id: ID!, $completed: Boolean!) {
    updateTaskCompleted(input: { id: $_id, completed: $completed }) {
      _id
      title
      completed
    }
  }
`

// ANCHOR Describe delete query
export const deleteQuery: TypedDocumentNode<DeleteTaskData, FaunaId> = gql`
  mutation deleteTask($_id: ID!) {
    deleteTask(id: $_id) {
      _id
    }
  }
`

/**
 * !SECTION
 */

// ANCHOR Get initial data in server-side
export const getInitialData = async (
  client: ApolloClient<NormalizedCacheObject>,
  currentUser: User | undefined | null
): Promise<TasksByUserData> => {
  if (typeof currentUser !== undefined) {
    const { data, errors } = await client.query<TasksByUserData>({
      query: query,
      variables: { _id: currentUser?._id },
    })
    if (errors) throw errors[0]
    return data
  }
  throw new Error('No user found')
}

/**
 * SECTION Context
 */

// ANCHOR Context value structure
interface AllTasksContextValue extends TasksByUserData {
  loading: boolean
  actions: {
    useCreateTask: () => MutationFromQuery<typeof createQuery>
    useUpdateTaskCompleted: () => MutationFromQuery<typeof updateCompletedQuery>
    useUpdateTaskTitle: () => MutationFromQuery<typeof updateTitleQuery>
    useDeleteTask: () => MutationFromQuery<typeof deleteQuery>
  }
}

// ANCHOR Context creation
export const AllTasksContext = createContext<AllTasksContextValue | undefined>(
  undefined
)

// ANCHOR Use Context hook
export const useAllTasksContext = (): AllTasksContextValue =>
  checkDefined(
    useContext(AllTasksContext),
    'AllTasksContext should not be undefined. Did you forget yo wrap your component inside a Provider?'
  )

// ANCHOR Context provider
interface AllTasksContextProviderProps {
  initialData: TasksByUserData
  currentUser: User
}

export const AllTasksContextProvider: FC<AllTasksContextProviderProps> = ({
  children,
  initialData,
  currentUser,
}) => {
  /**
   * SECTION Apollo hooks
   */

  // ANCHOR Send request using Apollo client to revalidate initial data
  const _id = currentUser._id

  const {
    loading,
    data: queryData,
    networkStatus,
  } = useQuery(query, { variables: { _id } })

  // ANCHOR Mutation which allows to create a new item
  const useCreateTask = (): MutationFromQuery<typeof createQuery> =>
    useMutation(createQuery, {
      update: (cache, { data }) => {
        const definedData = checkDefinedNotNull(
          data,
          'Returned data should not be null or undefined in the create task callback.'
        )
        const existingTasks = checkDefinedNotNull(
          cache.readQuery({
            query: query,
            variables: { _id },
          }),
          'Existing data should not be null or undefined in the create task callback.'
        )
        cache.writeQuery({
          query: query,
          variables: { _id },
          data: {
            findUserByID: {
              _id,
              tasks: {
                data: [
                  ...existingTasks.findUserByID.tasks.data,
                  definedData.createTask,
                ],
              },
            },
          },
        })
      },
    })

  // ANCHOR Mutations which allows to update an existing item's property
  const useUpdateTaskCompleted = (): MutationFromQuery<
    typeof updateCompletedQuery
  > => useMutation(updateCompletedQuery)

  const useUpdateTaskTitle = (): MutationFromQuery<typeof updateTitleQuery> =>
    useMutation(updateTitleQuery)

  // ANCHOR Mutations which allows to delete an existing item
  const useDeleteTask = (): MutationFromQuery<typeof deleteQuery> =>
    useMutation(deleteQuery, {
      update: (cache, { data }) => {
        const definedData = checkDefinedNotNull(
          data,
          'Returned data should not be null or undefined in the create task callback.'
        )
        const existingTasks = checkDefinedNotNull(
          cache.readQuery({
            query: query,
            variables: { _id },
          }),
          'Existing data should not be null or undefined in the create task callback.'
        )
        cache.writeQuery({
          query: query,
          variables: { _id },
          data: {
            findUserByID: {
              _id,
              tasks: {
                data: existingTasks.findUserByID.tasks.data.filter(
                  (task) => task._id !== definedData.deleteTask._id
                ),
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
    networkStatus,
    loading,
    actions: {
      useCreateTask,
      useUpdateTaskCompleted,
      useUpdateTaskTitle,
      useDeleteTask,
    },
  }

  // ANCHOR Template
  return (
    <AllTasksContext.Provider value={value}>
      {children}
    </AllTasksContext.Provider>
  )
}
/**
 * !SECTION
 */
