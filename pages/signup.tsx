import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { usePostSignUp } from '../utils/hooks/api-hooks';

const SignUp: NextPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const router = useRouter();
  const { mutateAsync: doPost, isLoading: isPosting } = usePostSignUp();

  return (
    <div>
      <h1>Sign Up</h1>
      <input
        type='text'
        className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
        placeholder='First Name'
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type='text'
        className='w-full border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
        placeholder='Last Name'
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
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
        onClick={(e) => {
          e.preventDefault();
          const newUser = { firstName, lastName, email, password };
          doPost(newUser)
            .then(() => {
              setFirstName('');
              setLastName('');
              setEmail('');
              setPassword('');
            })
            .finally(() => router.push('/login'));
        }}
      >
        Submit
      </button>
    </div>
  );
};

export default SignUp;
