import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { FC, useState } from 'react';
import { FaBars } from 'react-icons/fa';

const menuItems = [
  {
    title: 'Home',
    route: '/',
  },
  {
    title: 'Projects',
    route: '/projects',
  },
  {
    title: 'Contact',
    route: '/contact',
  },
];

export const Header: FC = () => {
  const [showMenu, setShowMenu] = useState('md:hidden');

  const { data, status } = useSession();

  const activeRoute =
    typeof window !== 'undefined' ? window.location.pathname : '/';

  return (
    <div className='text-white fixed top-0 left-0 right-0 z-50 font-Kanit'>
      <div
        className={`flex bg-theme justify-between items-center p-2 shadow-lg ${
          showMenu !== 'md:hidden' && 'flex-col'
        }`}
      >
        <div className='flex justify-between items-center w-full'>
          {status === 'authenticated' ? (
            <>
              <div className=' text-4xl'>
                Welcome: {data?.user?.name}{' '}
                <button
                  className=' cursor-pointer rounded mx-5 p-1 text-2xl bg-white text-theme'
                  onClick={() => signOut()}
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <h1 className='text-4xl font-semibold'>Amjad&apos;s Corner</h1>
          )}
          <FaBars
            className='lg:hidden xl:hidden 2xl:hidden 4xl:hidden md:flex cursor-pointer'
            onClick={() =>
              showMenu === 'md:hidden'
                ? setShowMenu('')
                : setShowMenu('md:hidden')
            }
          />
        </div>

        <div className='flex md:hidden text-2xl'>
          {menuItems.map((item) => (
            <li
              key={item.title}
              className={`list-none mx-5 p-1 ${
                item.route === activeRoute && 'bg-white text-black rounded-md'
              }`}
            >
              <Link href={item.route}>{item.title}</Link>
            </li>
          ))}
          {status === 'unauthenticated' && (
            <li
              className={`list-none mx-5 p-1 ${
                '/login' === activeRoute && 'bg-white text-black rounded-md'
              }`}
            >
              <Link href='/login'>Login</Link>
            </li>
          )}
        </div>
        <div
          className={`mt-5 md:flex items-start justify-start w-full flex-col text-2xl lg:hidden xl:hidden 2xl:hidden 4xl:hidden ${showMenu}`}
        >
          {menuItems.map((item) => (
            <li
              key={item.title}
              className={`list-none p-1 ${
                item.route === activeRoute &&
                'bg-white text-black rounded-md px-5'
              }`}
            >
              <Link href={item.route}>{item.title}</Link>
            </li>
          ))}
          {status === 'unauthenticated' && (
            <li
              className={`list-none p-1 ${
                '/login' === activeRoute &&
                'bg-white text-black rounded-md px-5'
              }`}
            >
              <Link href='/login'>Login</Link>
            </li>
          )}
        </div>
      </div>
    </div>
  );
};
