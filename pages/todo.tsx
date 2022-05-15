import { Player } from '@lottiefiles/react-lottie-player';
import { NextPage, NextPageContext } from 'next';
import { getSession } from 'next-auth/react';
import { Layout } from '../components';
import { AddTodoList } from '../components/todo/add-todo-list';
import { TodoListBlock } from '../components/todo/todo-list-block';
import { useGetTodoLists } from '../utils/hooks';

// https://assets7.lottiefiles.com/private_files/lf30_yABbl9.json !!!
const Todo: NextPage = () => {
  const { data, isFetching } = useGetTodoLists();
  return (
    <Layout>
      <div>
        <Player
          className='max-w-xs'
          autoplay
          loop
          src='https://assets7.lottiefiles.com/packages/lf20_spnbgchy.json'
        ></Player>
      </div>
      <div className='w-screen justify-center text-center mb-24'>
        <AddTodoList />
      </div>
      <div className='w-screen flex justify-center'>
        <TodoListBlock data={data?.todoLists} />
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
