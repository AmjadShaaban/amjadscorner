import { FC } from 'react';
import { FaRegCheckSquare, FaRegWindowClose } from 'react-icons/fa';
import { MdDeleteForever } from 'react-icons/md';
import { TiDelete } from 'react-icons/ti';
import { Tooltip } from 'react-tippy';
import { TodoList } from '../../interfaces';
import {
  useDeleteTodo,
  useDeleteTodoList,
  usePatchTodo,
} from '../../utils/hooks';
import { AddTodoListItem } from './add-todo-list-item';

interface TodoListProps {
  data: TodoList[] | undefined;
}

export const TodoListBlock: FC<TodoListProps> = ({ data }) => {
  const { mutateAsync: doDelete } = useDeleteTodo();
  const { mutateAsync: doDeleteList } = useDeleteTodoList();
  const { mutateAsync: doPatchTodo } = usePatchTodo();

  if (data === undefined) {
    return <>No Lists Found</>;
  }

  return (
    <div className='w-11/12 grid grid-cols-2 gap-4 items-center justify-center content-center'>
      {data.map((list) => (
        <div key={list._id} className='p-10 shadow-2xl bg-gray-100 rounded'>
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
      ))}
    </div>
  );
};
