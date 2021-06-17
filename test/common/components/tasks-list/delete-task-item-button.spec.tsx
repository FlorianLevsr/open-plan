import React from 'react'
import { DeleteTaskItemButton } from '../../../../src/common/components/task-list/task-item'
import { renderUsingAllTasks, task } from '../../../utils/all-tasks'

it('should render correctly', () => {
  const tree = renderUsingAllTasks(
    <DeleteTaskItemButton task={task} />
  ).toJSON()

  expect(tree).toMatchSnapshot()
})
