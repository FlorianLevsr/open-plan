export interface FaunaId {
  _id: string
}

export interface FaunaEntity extends FaunaId {
  _ts: number
}

export interface FaunaPage<T> {
  data: T[]
  after?: string
  before?: string
}

export interface User extends FaunaEntity {
  username: string
  tasks?: Task[]
}

export interface Task extends FaunaEntity {
  title: string
  completed?: boolean
}

export interface NewTaskInput {
  title?: string
  completed?: boolean
}

export type ExistingTaskInput = NewTaskInput | FaunaId
