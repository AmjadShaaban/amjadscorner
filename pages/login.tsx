import { NextPage } from 'next';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

const Login: NextPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div>
      <h1>LOGIN</h1>
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
        onClick={(e) => {
          e.preventDefault();
          signIn('credentials', { callbackUrl: '/', username, password }).then(
            (r) => console.log(r)
          );
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default Login;
