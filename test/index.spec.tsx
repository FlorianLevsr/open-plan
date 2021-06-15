import React from 'react'
import { mount } from 'enzyme'
import LoginPage from '../src/pages/login';

import { createMockClient } from 'mock-apollo-client';
import { loginQuery } from '../src/common/context/AuthContext';


describe("LoginPage", () => {

  const wrapper = mount(<LoginPage/>)
  const form = wrapper.find('form');
  const submitHandler = jest.fn();

  it('contains a form', async () => {
    expect(wrapper.find('form'));
  })

  it('', async () => {
  })

});

