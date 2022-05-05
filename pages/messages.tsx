import { Player } from '@lottiefiles/react-lottie-player';
import { NextPage } from 'next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { FiDelete } from 'react-icons/fi';
import { Layout } from '../components';
import { useGetMessages, useDeleteMessage } from '../utils/hooks';

const Messages: NextPage = () => {
  const { data: session, status } = useSession();
  const { data, isFetching } = useGetMessages();
  const { mutateAsync: doDelete, isLoading: isDeleting } = useDeleteMessage();

  return (
    <Layout>
      {isFetching ? (
        <h1>LOADING...</h1>
      ) : status !== 'authenticated' ? (
        <h1>NOT AUTHENTICATED</h1>
      ) : session?.user?.role !== 'ADMIN' ? (
        <h1>NOT AUTHORIZED</h1>
      ) : (
        <>
          <div>
            <Player
              className='max-w-xs'
              autoplay
              loop
              src='https://assets9.lottiefiles.com/private_files/lf30_odansovk.json'
            ></Player>
          </div>
          {data?.messages?.map((msg) => (
            <div key={msg._id}>
              <div className='w-screen flex justify-center m-10'>
                <div className='md:w-full w-1/2 p-10 shadow-2xl bg-gray-100 rounded'>
                  <FiDelete
                    className=' text-red-500 cursor-pointer float-right'
                    onClick={() => doDelete(msg._id)}
                  />
                  <h3 className='font-bold text-orange-500'>
                    From: {msg.name}
                  </h3>
                  <p className=' text-center italic'>{msg.message}</p>
                  <Link href={`mailto:${msg.email}`}>Reply</Link>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </Layout>
  );
};
export default Messages;
