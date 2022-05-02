import { Player } from '@lottiefiles/react-lottie-player';
import { NextPage } from 'next';
import { Layout } from '../components/layout';
import { useGetMessages } from '../utils/hooks/api-hooks';

const Messages: NextPage = () => {
  const { data, isFetching } = useGetMessages();
  return (
    <Layout>
      <div className=' mt-16'>
        <div>
          <Player
            className='max-w-xs'
            autoplay
            loop
            src='https://assets9.lottiefiles.com/private_files/lf30_odansovk.json'
          ></Player>
        </div>
        <h1>All Incoming messages</h1>
        {data?.messages?.map((msg) => (
          <div key={msg._id}>
            <h3>From: {msg.name}</h3>
            <h5>Email: {msg.email}</h5>
            <p>{msg.message}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
};
export default Messages;
