import React, { createContext, FC, useContext } from 'react'
import {
  gql,
  useQuery,
  useMutation,
  ApolloClient,
  NormalizedCacheObject,
  MutationTuple,
} from '@apollo/client'
import { FaunaId, Task, User } from '../types/fauna'
import { ExistingTaskInput, NewTaskInput } from '../types/fauna'
import { checkDefined, checkDefinedNotNull } from '../utils/type-checks'

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

// ANCHOR Create and update mutation return data structure
interface CreateTaskData {
  createTask: Task
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
export const query = gql`
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
const createQuery = gql`
  mutation createTask($title: String!) {
    createTask(input: { title: $title }) {
      _id
      title
      completed
    }
  }
`

// ANCHOR Describe update task title query
const updateTitleQuery = gql`
  mutation updateTaskTitle($_id: ID!, $title: String!) {
    updateTaskTitle(input: { id: $_id, title: $title }) {
      _id
      title
      completed
    }
  }
`

// ANCHOR Describe update task completed query
const updateCompletedQuery = gql`
  mutation updateTaskCompleted($_id: ID!, $completed: Boolean!) {
    updateTaskCompleted(input: { id: $_id, completed: $completed }) {
      _id
      title
      completed
    }
  }
`

// ANCHOR Describe delete query
const deleteQuery = gql`
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
    useCreateTask: () => MutationTuple<CreateTaskData, Partial<Task>>
    useUpdateTaskCompleted: () => MutationTuple<CreateTaskData, Partial<Task>>
    useUpdateTaskTitle: () => MutationTuple<CreateTaskData, Partial<Task>>
    useDeleteTask: () => MutationTuple<DeleteTaskData, FaunaId>
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
  } = useQuery<TasksByUserData>(query, { variables: { _id } })

  // ANCHOR Mutation which allows to create a new item
  const useCreateTask = (): MutationTuple<CreateTaskData, NewTaskInput> =>
    useMutation<CreateTaskData, NewTaskInput>(createQuery, {
      update: (cache, { data }) => {
        const definedData = checkDefinedNotNull(
          data,
          'Returned data should not be null or undefined in the create task callback.'
        )
        const existingTasks = checkDefinedNotNull(
          cache.readQuery<TasksByUserData>({
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
  const useUpdateTaskCompleted = (): MutationTuple<
    CreateTaskData,
    ExistingTaskInput
  > => useMutation<CreateTaskData, ExistingTaskInput>(updateCompletedQuery)

  const useUpdateTaskTitle = (): MutationTuple<
    CreateTaskData,
    ExistingTaskInput
  > => useMutation<CreateTaskData, ExistingTaskInput>(updateTitleQuery)

  // ANCHOR Mutations which allows to delete an existing item
  const useDeleteTask = (): MutationTuple<DeleteTaskData, FaunaId> =>
    useMutation<DeleteTaskData, FaunaId>(deleteQuery, {
      update: (cache, { data }) => {
        const definedData = checkDefinedNotNull(
          data,
          'Returned data should not be null or undefined in the create task callback.'
        )
        const existingTasks = checkDefinedNotNull(
          cache.readQuery<TasksByUserData>({
            query: query,
            variables: { _id },
          }),
          'Existing data should not be null or undefined in the create task callback.'
        )
        if (!existingTasks) throw new Error('Pouet')
        cache.writeQuery({
          query: query,
          variables: { _id },
          data: {
            findUserByID: {
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
