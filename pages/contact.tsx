import { NextPage } from 'next';
import { Player } from '@lottiefiles/react-lottie-player';
import { Layout } from '../components/layout';
import { useState } from 'react';

const Contact: NextPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  return (
    <Layout>
      <div>
        <div className='h-full mt-10'>
          <Player
            className='h-1/2 max-w-7xl'
            autoplay
            loop
            src='https://assets10.lottiefiles.com/packages/lf20_u25cckyh.json'
          ></Player>
        </div>
        <div className='w-screen flex justify-center'>
          <div className='md:w-full w-1/2 p-10 shadow-2xl bg-gray-100 rounded'>
            <h1 className='text-2xl font-semibold'>Get in touch with me!</h1>
            <input
              type='text'
              className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
              placeholder='Name'
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type='text'
              className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
              placeholder='Email'
              onChange={(e) => setEmail(e.target.value)}
            />
            <textarea
              className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
              placeholder='Message'
              onChange={(e) => setMessage(e.target.value)}
            />
            <button
              type='submit'
              className='bg-red-600 rounded text-white px-5 py-1 mt-4'
              onClick={(e) => {
                e.preventDefault();
                let data = { name, email, message };
                console.log('data: ', data);
              }}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
