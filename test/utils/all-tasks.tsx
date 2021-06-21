import { InMemoryCache } from '@apollo/client'
import { MockedProvider } from '@apollo/client/testing'
import React from 'react'
import { FC } from 'react'
import {
  query,
  createQuery,
  updateTitleQuery,
  updateCompletedQuery,
  deleteQuery,
  AllTasksContextProvider,
} from '../../src/common/data/all-tasks'
import { User, Task } from '../../src/common/types/fauna'
import { MockType } from './types'

export const user: User = { _id: 'user0', _ts: 0, username: 'a' }
export const task: Task = {
  _id: 'task0',
  _ts: 0,
  title: 'Test task',
  completed: false,
}
const initialData = {
  findUserByID: {
    _id: user._id,
    tasks: { data: [task] },
  },
}

const queryMock: MockType<typeof query> = {
  request: {
    query,
    variables: { _id: user._id },
  },
  result: {
    data: initialData,
  },
}

const createQueryMock: MockType<typeof createQuery> = {
  request: {
    query: createQuery,
    variables: { title: 'Another test task' },
  },
  result: {
    data: {
      createTask: {
        _id: 'task1',
        _ts: 1,
        title: 'Another test task',
        completed: false,
      },
    },
  },
}

const updateTitleQueryMock: MockType<typeof updateTitleQuery> = {
  request: {
    query: updateTitleQuery,
    variables: { _id: 'task0', title: 'Updated test task' },
  },
  result: {
    data: {
      updateTaskTitle: {
        _id: 'task0',
        _ts: 0,
        title: 'Updated test task',
        completed: false,
      },
    },
  },
}

const updateCompletedQueryMock: MockType<typeof updateCompletedQuery> = {
  request: {
    query: updateCompletedQuery,
    variables: { _id: 'task0', completed: true },
  },
  result: {
    data: {
      updateTaskCompleted: {
        _id: 'task0',
        _ts: 0,
        title: 'Updated test task',
        completed: true,
      },
    },
  },
}

const deleteQueryMock: MockType<typeof deleteQuery> = {
  request: {
    query: deleteQuery,
    variables: { _id: 'task0' },
  },
  result: {
    data: {
      deleteTask: {
        _id: 'task0',
      },
    },
  },
}

const mocks = [
  queryMock,
  createQueryMock,
  updateTitleQueryMock,
  updateCompletedQueryMock,
  deleteQueryMock,
]

export const TestAllTasks: FC<{ cache: InMemoryCache }> = ({
  cache,
  children,
}) => (
  <MockedProvider
    cache={cache}
    mocks={mocks}
    addTypename={false}
    // defaultOptions={{ watchQuery: { fetchPolicy: 'no-cache' } }}
  >
    <AllTasksContextProvider currentUser={user} initialData={initialData}>
      {children}
    </AllTasksContextProvider>
  </MockedProvider>
)
