import { NextPage, NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import { Layout } from '../components';
import { AddTodoList } from '../components/todo/add-todo-list';
import { AddTodoListItem } from '../components/todo/add-todo-list-item';
import {
  useDeleteTodo,
  useGetTodoLists,
  useDeleteTodoList,
  usePatchTodo,
} from '../utils/hooks';
import { MdDeleteForever } from 'react-icons/md';
import { TiDelete } from 'react-icons/ti';
import { FaRegCheckSquare, FaRegWindowClose } from 'react-icons/fa';
import { Tooltip } from 'react-tippy';
import { Player } from '@lottiefiles/react-lottie-player';

// https://assets7.lottiefiles.com/packages/lf20_spnbgchy.json todo

// https://assets5.lottiefiles.com/packages/lf20_GIyuXJ.json 404

// https://assets7.lottiefiles.com/private_files/lf30_yABbl9.json !!!
const Todo: NextPage = () => {
  const { data, isFetching } = useGetTodoLists();
  const { mutateAsync: doDelete } = useDeleteTodo();
  const { mutateAsync: doDeleteList } = useDeleteTodoList();
  const { mutateAsync: doPatchTodo } = usePatchTodo();
  return (
    <Layout>
      <div className=' w-screen justify-center items-center'>
        <div>
          <Player
            className='max-w-xs'
            autoplay
            loop
            src='https://assets7.lottiefiles.com/packages/lf20_spnbgchy.json'
          ></Player>

          <AddTodoList />
        </div>

        <div className=' grid grid-cols-2 gap-1 items-center justify-center'>
          {Array.isArray(data?.todoLists) && data?.todoLists.length ? (
            data?.todoLists.map((list) => (
              <div
                key={list._id}
                className='p-10 shadow-2xl bg-gray-100 rounded'
              >
                <h1 className='text-4xl flex'>
                  <Tooltip title={`Delete ${list.label}`}>
                    <MdDeleteForever
                      className='cursor-pointer text-red-600'
                      onClick={() => {
                        doDeleteList(list._id);
                      }}
                    />
                  </Tooltip>
                  {list.label}
                </h1>
                <ul>
                  {Array.isArray(list.todos) && list.todos.length ? (
                    list.todos.map((todo) => (
                      <li key={todo._id} className='flex'>
                        <Tooltip title={`Delete ${todo.label}`}>
                          <TiDelete
                            className=' cursor-pointer text-red-600'
                            onClick={() => {
                              doDelete(todo._id);
                            }}
                          />
                        </Tooltip>
                        {todo.label}{' '}
                        {todo.done ? (
                          <Tooltip title='Done'>
                            <FaRegCheckSquare
                              className='cursor-pointer text-green-600'
                              onClick={() => {
                                doPatchTodo(todo._id);
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Tooltip title='Not done'>
                            <FaRegWindowClose
                              className='cursor-pointer text-red-600'
                              onClick={() => {
                                doPatchTodo(todo._id);
                              }}
                            />
                          </Tooltip>
                        )}
                      </li>
                    ))
                  ) : (
                    <div>No Items YET</div>
                  )}
                </ul>
                <div>
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

export const getServerSideProps = async (context: NextPageContext) => {
  const session = await getSession({ req: context.req });
  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: { session },
  };
};

export default Todo;
