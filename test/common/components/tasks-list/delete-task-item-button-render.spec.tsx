import { InMemoryCache } from '@apollo/client'
import React from 'react'
import testRenderer from 'react-test-renderer'
import { DeleteTaskItemButton } from '../../../../src/common/components/task-list/task-item'
import { task, TestAllTasks } from '../../../utils/all-tasks'

/**
 * SECTION Test suite
 */
describe('Task item delete button', () => {
  let cache: InMemoryCache

  // ANCHOR Unit test - check for the component's HTML rendering
  it('should render correctly', () => {
    // Create a static render
    const tree = testRenderer
      .create(
        <TestAllTasks cache={cache}>
          <DeleteTaskItemButton task={task} />
        </TestAllTasks>
      )
      .toJSON()

    // Check the static render against the snapshot
    expect(tree).toMatchSnapshot()
  })
})
