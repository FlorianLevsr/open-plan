import React, { createContext, FC, useContext } from 'react'
import {
  gql,
  useQuery,
  useMutation,
  ApolloClient,
  NormalizedCacheObject,
  MutationTuple,
} from '@apollo/client'
import { FaunaId, Task, User } from '../../types/fauna'

// Describe query data structure
export interface TasksByUserData {
  findUserByID: {
    _id: string
    tasks: {
      data: Task[]
    }
  }
}

interface CreateTaskData {
  createTask: Task
}

interface DeleteTaskData {
  deleteTask: FaunaId
}

/**
 * SECTION GraphQL queries
 */

// Describe tasks by user query
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

// Describe create query
const createQuery = gql`
  mutation createTask($title: String!) {
    createTask(input: { title: $title }) {
      _id
      title
      completed
    }
  }
`

// Describe update task title query
const updateTitleQuery = gql`
  mutation updateTaskTitle($_id: ID!, $title: String!) {
    updateTaskTitle(input: { id: $_id, title: $title }) {
      _id
      title
      completed
    }
  }
`

// Describe update task completed query
const updateCompletedQuery = gql`
  mutation updateTaskCompleted($_id: ID!, $completed: Boolean!) {
    updateTaskCompleted(input: { id: $_id, completed: $completed }) {
      _id
      title
      completed
    }
  }
`

// Describe delete query
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

interface AllTasksContextValue extends TasksByUserData {
  loading: boolean
  actions: {
    useCreateTask: () => MutationTuple<CreateTaskData, Partial<Task>>
    useUpdateTaskCompleted: () => MutationTuple<CreateTaskData, Partial<Task>>
    useUpdateTaskTitle: () => MutationTuple<CreateTaskData, Partial<Task>>
    useDeleteTask: () => MutationTuple<DeleteTaskData, FaunaId>
  }
}

export const AllTasksContext = createContext<AllTasksContextValue | undefined>(
  undefined
)

export const useAllTasksContext = (): AllTasksContextValue => {
  const contextIsDefined = useContext(AllTasksContext)
  if (typeof contextIsDefined === 'undefined') {
    throw new Error(
      'AllTasksContext should not be undefined. Did you forget yo wrap your component inside a Provider?'
    )
  }
  return contextIsDefined
}

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
  const useCreateTask = (): MutationTuple<CreateTaskData, Partial<Task>> =>
    useMutation<CreateTaskData, Partial<Task>>(createQuery, {
      update: (cache, { data }) => {
        if (!data) throw new Error('Pouet')
        const existingTasks = cache.readQuery<TasksByUserData>({
          query: query,
          variables: { _id },
        })
        if (!existingTasks) throw new Error('Pouet Pouet')
        cache.writeQuery({
          query: query,
          variables: { _id },
          data: {
            findUserByID: {
              tasks: {
                data: [
                  ...existingTasks.findUserByID.tasks.data,
                  data.createTask,
                ],
              },
            },
          },
        })
      },
    })

  const useUpdateTaskCompleted = (): MutationTuple<
    CreateTaskData,
    Partial<Task>
  > => useMutation<CreateTaskData, Partial<Task>>(updateCompletedQuery)

  const useUpdateTaskTitle = (): MutationTuple<CreateTaskData, Partial<Task>> =>
    useMutation<CreateTaskData, Partial<Task>>(updateTitleQuery)

  const useDeleteTask = (): MutationTuple<DeleteTaskData, FaunaId> =>
    useMutation<DeleteTaskData, FaunaId>(deleteQuery, {
      update: (cache, { data }) => {
        if (!data) throw new Error('Pouet')
        const existingTasks = cache.readQuery<TasksByUserData>({
          query: query,
          variables: { _id },
        })
        if (!existingTasks) throw new Error('Pouet')
        cache.writeQuery({
          query: query,
          variables: { _id },
          data: {
            findUserByID: {
              tasks: {
                data: existingTasks.findUserByID.tasks.data.filter(
                  (task) => task._id !== data.deleteTask._id
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
