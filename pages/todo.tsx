import { NextPage } from 'next';
import { useState } from 'react';
import { Layout } from '../components';
import { AddTodoList } from '../components/todo/add-todo-list';
import { AddTodoListItem } from '../components/todo/add-todo-list-item';
import { useGetTodoLists, usePostTodo } from '../utils/hooks';

const Todo: NextPage = () => {
  const { data, isFetching } = useGetTodoLists();
  return (
    <Layout>
      <div className=' bg-yellow-300'>
        <AddTodoList />
        <div>
          {Array.isArray(data?.todoLists) && data?.todoLists.length ? (
            data?.todoLists.map((list) => (
              <div key={list._id}>
                <h1 className='text-4xl'>{list.label}</h1>
                {Array.isArray(list.todos) && list.todos.length ? (
                  list.todos.map((todo) => (
                    <div key={todo._id}>{todo.label}</div>
                  ))
                ) : (
                  <div>No Items YET</div>
                )}
                <div className=' bg-orange-300'>
                  <AddTodoListItem listId={list._id} />
                </div>
              </div>
            ))
          ) : (
            <div>No Lists YET</div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Todo;
