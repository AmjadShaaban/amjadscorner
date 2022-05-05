import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Layout } from '../components/layout';
import { Player } from '@lottiefiles/react-lottie-player';
import { useSession } from 'next-auth/react';

const Login: NextPage = () => {
  const router = useRouter();

  const { status } = useSession();

  if (status === 'authenticated') {
    router.replace('/');
  }
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <Layout>
      <Player
        className='max-w-lg'
        autoplay
        loop
        src='https://assets8.lottiefiles.com/packages/lf20_87uabjh2.json'
      ></Player>

      <div className='w-screen flex justify-center'>
        <div className='md:w-full w-1/2 p-10 shadow-2xl bg-gray-100 rounded'>
          <h1>LOGIN</h1>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signIn('credentials', { callbackUrl: '/', username, password });
            }}
          >
            <input
              type='text'
              className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
              placeholder='Username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type='password'
              className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
              placeholder='Password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type='submit'
              className='bg-red-600 rounded text-white px-5 py-1 mt-4'
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
