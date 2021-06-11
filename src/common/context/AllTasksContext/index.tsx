import React, { createContext, FC } from "react";
import { ApolloClient, gql, NormalizedCacheObject } from '@apollo/client/core';
import { useQuery, useMutation } from '@apollo/client/react';
import { FaunaId, FaunaPage, Task } from "../../types/fauna";

// Describe query data structure
export interface AllTasksData {
  allTasks: FaunaPage<Task>
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

export const getInitialData = async (client: ApolloClient<NormalizedCacheObject>) => {
  const { data, errors } = await client.query<AllTasksData>({ query });
  if (errors) throw errors[0];
  return data;
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
  allTasks: { data: [] },
  actions: {
    createTask: () => undefined,
    updateTaskCompleted: () => undefined,
    updateTaskTitle: () => undefined,
    deleteTask: () => undefined,
  }
});

interface AllTasksContextProviderProps {
  initialData: AllTasksData;
}

export const AllTasksContextProvider: FC<AllTasksContextProviderProps> = ({ children, initialData }) => {
  /**
   * SECTION Apollo hooks
   */
  // ANCHOR Send request using Apollo client to revalidate initial data
  const { loading, error, data: queryData } = useQuery<AllTasksData>(query);
  // ANCHOR Mutation which allows to create a new item
  const [createTaskMutation] = useMutation<CreateTaskData, Partial<Task>>(createQuery, {
    update: (cache, { data }) => {
      if (!data) throw new Error('Pouet');
      const existingTasks = cache.readQuery<AllTasksData>({ query });
      if (!existingTasks) throw new Error('Pouet');
      cache.writeQuery({ query, data: {
        allTasks: [...existingTasks.allTasks.data, data.createTask]
      }});
    }
  });
  // ANCHOR Mutations which allows to modify an existing item
  const [updateTaskCompletedMutation] = useMutation<CreateTaskData, Partial<Task>>(updateCompletedQuery);
  const [updateTaskTitleMutation] = useMutation<CreateTaskData, Partial<Task>>(updateTitleQuery);
  // ANCHOR Mutation which allows to delete an existing item
  const [deleteTaskMutation] = useMutation<DeleteTaskData, FaunaId>(deleteQuery, {
    update: (cache, { data }) => {
      if (!data) throw new Error('Pouet');
      const existingTasks = cache.readQuery<AllTasksData>({ query });
      if (!existingTasks) throw new Error('Pouet');
      cache.writeQuery({ query, data : {
        allTasks: existingTasks.allTasks.data.filter(
          task => task._id !== data.deleteTask._id
        )
      }});
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
