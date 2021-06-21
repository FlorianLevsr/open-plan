import { InMemoryCache } from '@apollo/client'
import { act } from '@testing-library/react'
import { mount } from 'enzyme'
import React from 'react'
import { DeleteTaskItemButton } from '../../../../src/common/components/task-list/task-item'
import { query } from '../../../../src/common/data/all-tasks'
import { checkDefinedNotNull } from '../../../../src/common/utils/type-checks'
import { task, TestAllTasks, user } from '../../../utils/all-tasks'

// This function forces tests to wait for hooks to resolve
const waitForResponse = (): Promise<void> =>
  new Promise((res) => setTimeout(res, 0))

/**
 * SECTION Test suite
 */
describe('Task item delete button', () => {
  let cache: InMemoryCache

  // ANCHOR Operations to trigger before each test
  beforeEach(() => {
    // Reset memory cache
    cache = new InMemoryCache({ addTypename: false })
  })

  // ANCHOR Functional test - check the component intially triggers a query that fills the cache
  it('should find appointed task available in cache', async () => {
    // Mount component in a virtual DOM
    mount(
      <TestAllTasks cache={cache}>
        <DeleteTaskItemButton task={task} />
      </TestAllTasks>
    )

    // Wait for hooks to resolve
    await act(async () => {
      await waitForResponse()
    })

    // Read result from the GraphQL query
    const data = cache.readQuery({ query, variables: { _id: user._id } })
    // The query result should not be null
    expect(data).not.toBeNull()

    // Filter out the appointed task from the query result
    const filteredTasks = checkDefinedNotNull(
      data
    ).findUserByID.tasks.data.filter((item) => item._id === task._id)
    // There should be exactly one copy of the appointed task in the query result
    expect(filteredTasks).toHaveLength(1)
  })

  // ANCHOR Functional test - check the component triggers a mutation that deletes an item from the cache
  it('should delete a task from the cache when clicked', async () => {
    // Mount component in a virtual DOM
    const element = mount(
      <TestAllTasks cache={cache}>
        <DeleteTaskItemButton task={task} />
      </TestAllTasks>
    )

    // Wait for hooks to resolve
    await act(async () => {
      await waitForResponse()
      // Simulate a click on the button
      element.simulate('click')
      // Wait for hooks to resolve again
      await waitForResponse()
    })

    // Read result from the GraphQL query
    const data = cache.readQuery({ query, variables: { _id: user._id } })
    // Filter out the appointed task from the query result
    const filteredTasks = checkDefinedNotNull(
      data
    ).findUserByID.tasks.data.filter((item) => item._id === task._id)

    // There should be no copies of the apppointed task in the query result anymore
    expect(filteredTasks).toHaveLength(0)
  })
})
/**
 * !SECTION
 */
