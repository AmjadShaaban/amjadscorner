import { NextPage } from 'next';
import { Layout } from '../components';
import { AddTodoList } from '../components/todo/add-todo-list';
import { AddTodoListItem } from '../components/todo/add-todo-list-item';
import {
  useDeleteTodo,
  useGetTodoLists,
  useDeleteTodoList,
  usePatchTodo,
} from '../utils/hooks';

const Todo: NextPage = () => {
  const { data, isFetching } = useGetTodoLists();
  const { mutateAsync: doDelete } = useDeleteTodo();
  const { mutateAsync: doDeleteList } = useDeleteTodoList();
  const { mutateAsync: doPatchTodo } = usePatchTodo();
  return (
    <Layout>
      <div className=' bg-yellow-300'>
        <AddTodoList />
        <div>
          {Array.isArray(data?.todoLists) && data?.todoLists.length ? (
            data?.todoLists.map((list) => (
              <div key={list._id}>
                <h1 className='text-4xl'>
                  {list.label}{' '}
                  <button
                    className='bg-red-400 m-4 rounded p-4 text-xs'
                    onClick={() => {
                      doDeleteList(list._id);
                    }}
                  >
                    DELETE
                  </button>
                </h1>
                {Array.isArray(list.todos) && list.todos.length ? (
                  list.todos.map((todo) => (
                    <div key={todo._id}>
                      <button
                        className='bg-red-400 m-4 rounded p-4 text-xs'
                        onClick={() => {
                          doPatchTodo(todo._id);
                        }}
                      >
                        {todo.done ? <>Undone</> : <>Done</>}
                      </button>
                      {todo.label}{' '}
                      <button
                        className='bg-red-400 m-4 rounded p-4 text-xs'
                        onClick={() => {
                          doDelete(todo._id);
                        }}
                      >
                        DELETE
                      </button>
                    </div>
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
      <pre>{JSON.stringify(data?.todoLists, null, 4)}</pre>
    </Layout>
  );
};

export default Todo;
