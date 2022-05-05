import { Player } from '@lottiefiles/react-lottie-player';
import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Layout } from '../components';
import { usePostSignUp } from '../utils/hooks';

const SignUp: NextPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { mutateAsync: doPost, isLoading: isPosting } = usePostSignUp();

  return (
    <Layout>
      <div className='mt-20 mb-24'>
        <Player
          className='max-w-lg'
          autoplay
          loop
          src='https://assets10.lottiefiles.com/packages/lf20_nelmbapa.json'
        ></Player>

        <div className='w-screen flex justify-center'>
          <div className='md:w-full w-1/2 p-10 shadow-2xl bg-gray-100 rounded'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newUser = { firstName, lastName, email, password };
                doPost(newUser).finally(() => router.push('/login'));
              }}
            >
              <div className=' w-full'>
                <input
                  type='text'
                  className='w-1/2 border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
                  placeholder='First Name'
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
                <input
                  type='text'
                  className='w-1/2 border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
                  placeholder='Last Name'
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <input
                type='text'
                className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
      </div>
    </Layout>
  );
};

export default SignUp;
