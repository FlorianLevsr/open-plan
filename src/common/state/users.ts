import { Query, Store } from '@datorama/akita'
import { User } from '../types/fauna'

export type UsersState = Record<string, User>

export class UsersStore extends Store<UsersState> {
  constructor() {
    super({}, { name: 'session' })
  }
}

export class UsersQuery extends Query<UsersState> {
  constructor(protected store: UsersStore) {
    super(store)
  }
}

export const userQuery = new UsersQuery(new UsersStore())

export class UsersService {
  constructor(private usersStore: UsersStore) {}

  get = (token: string): User | undefined => userQuery.getValue()[token]

  set = (token: string, user: User): void => {
    this.usersStore.update((state) => ({ ...state, [token]: user }))
  }

  remove = (token: string): void => {
    this.usersStore.update((state) => {
      const newState: UsersState = {}
      for (const key in state) {
        if (key !== token) {
          newState[key] = state[key]
        }
      }
      return newState
    })
  }

  resest = (): void => {
    this.usersStore.update({})
  }
}

const usersService = new UsersService(new UsersStore())

export default usersService
