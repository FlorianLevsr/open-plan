import React, { createContext, FC } from "react";
import { gql, useQuery, useMutation, ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { FaunaId, Task, User } from "../../types/fauna";

// Describe query data structure
export interface AllTasksData {
  findUserByID: {
    _id: String
    tasks: {
      data: Task[]
    }
  }
}

interface CreateTaskData {
  createTask: Task;
}

interface DeleteTaskData {
  deleteTask: FaunaId;
}

/**
 * SECTION GraphQL queries
 */
// Describe data to query from the API
export const query = gql`
  query AllTasksQuery {
    allTasks {
      data {
        _id
        title
        completed
      }
    }
  }
`;

// TEST // Describe tasks by user
export const testQuery = gql`
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
`;

// Describe create query
const createQuery = gql`
  mutation createTask($title: String!) {
    createTask(input: { title: $title }) {
      _id
      title
      completed
    }
  }
`;



// Describe update task title query
const updateTitleQuery = gql`
  mutation updateTaskTitle($_id: ID!, $title: String!) {
    updateTaskTitle(input: {
      id: $_id,
      title: $title,
    }) {
      _id
      title
      completed
    }
  }
`;

// Describe update task completed query
const updateCompletedQuery = gql`
  mutation updateTaskCompleted($_id: ID!, $completed: Boolean!) {
    updateTaskCompleted(input: {
      id: $_id,
      completed: $completed,
    }) {
      _id
      title
      completed
    }
  }
`;

// Describe delete query
const deleteQuery = gql`
  mutation deleteTask($_id: ID!) {
    deleteTask(id: $_id) {
      _id
    }
  }
`;
/**
 * !SECTION
 */

export const getInitialData = async (client: ApolloClient<NormalizedCacheObject>, currentUser: User | undefined | null) => {
  if (typeof currentUser !== undefined) {
    const { data, errors } = await client.query<AllTasksData>({ query: testQuery, variables: { _id: currentUser?._id } });
    if (errors) throw errors[0];
    return data;
  }
  throw new Error('No user found')
}

interface AllTasksContextValue extends AllTasksData {
  actions: {
    createTask: (task: Partial<Task>) => void;
    updateTaskCompleted: (id: string, completed: boolean) => void;
    updateTaskTitle: (id: string, title: string) => void;
    deleteTask: (id: string) => void;
  }
}

export const AllTasksContext = createContext<AllTasksContextValue>({
  findUserByID: { _id: '', tasks: { data: [] } },
  actions: {
    createTask: () => undefined,
    updateTaskCompleted: () => undefined,
    updateTaskTitle: () => undefined,
    deleteTask: () => undefined,
  }
});

interface AllTasksContextProviderProps {
  initialData: AllTasksData;
  currentUser: User
}



export const AllTasksContextProvider: FC<AllTasksContextProviderProps> = ({ children, initialData, currentUser }) => {
  /**
   * SECTION Apollo hooks
   */
  // ANCHOR Send request using Apollo client to revalidate initial data

  let _id = currentUser._id;

  const { loading, error, data: queryData } = useQuery<AllTasksData>(testQuery, { variables: { _id } });

  // ANCHOR Mutation which allows to create a new item
  const [createTaskMutation] = useMutation<CreateTaskData, Partial<Task>>(createQuery, {
    update: (cache, { data }) => {
      if (!data) throw new Error('Pouet');
      const existingTasks = cache.readQuery<AllTasksData>({ query: testQuery, variables: { _id }});
      if (!existingTasks) throw new Error('Pouet Pouet');
      cache.writeQuery({
        query: testQuery, variables: { _id }, data: {
          findUserByID: { tasks: { data: [...existingTasks.findUserByID.tasks.data, data.createTask] } }
        }
      });
    }
  });

  const [updateTaskCompletedMutation] = useMutation<CreateTaskData, Partial<Task>>(updateCompletedQuery);

  const [updateTaskTitleMutation] = useMutation<CreateTaskData, Partial<Task>>(updateTitleQuery);

  const [deleteTaskMutation] = useMutation<DeleteTaskData, FaunaId>(deleteQuery, {
    update: (cache, { data }) => {
      if (!data) throw new Error('Pouet');
      const existingTasks = cache.readQuery<AllTasksData>({ query: testQuery, variables: { _id } });
      if (!existingTasks) throw new Error('Pouet');
      cache.writeQuery({
        query: testQuery, variables: { _id },  data: {
          findUserByID: {
            tasks: {
              data: existingTasks.findUserByID.tasks.data.filter(
                task => task._id !== data.deleteTask._id
              )
            }
          }
        }
      });
    }
  });
  /**
   * !SECTION
   */

  
  // If query hasn't returned a result yet, use initial data
  const data = queryData || initialData;

  // ANCHOR Pack data and actions to dispatch through components
  const value = {
    ...data,
    actions: {
      createTask: (task: Partial<Task>) => { createTaskMutation({ variables: { ...task } }); },
      updateTaskCompleted: (_id: string, completed: boolean) => { updateTaskCompletedMutation({ variables: { _id, completed } }); },
      updateTaskTitle: (_id: string, title: string) => { updateTaskTitleMutation({ variables: { _id, title } }); },
      deleteTask: (_id: string) => { deleteTaskMutation({ variables: { _id } }); },
    }
  }

  // ANCHOR Template
  return (
    <AllTasksContext.Provider value={value}>
      {children}
    </AllTasksContext.Provider>
  );
}
