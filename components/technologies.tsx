import { FC } from 'react';
import {
  FaAngular,
  FaCss3,
  FaGitAlt,
  FaHtml5,
  FaNodeJs,
  FaReact,
} from 'react-icons/fa';
import {
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

export const Technologies: FC = () => {
  return (
    <div className='mt-20'>
      <h1 className='text-4xl text-blue-800 font-bold text-center my-8'>
        Technologies I Use
      </h1>
      <div className='grid md:grid-cols-1 grid-cols-4'>
        <SiTypescript
          size={180}
          color='#2762BA'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <SiJavascript
          size={180}
          color='yellow'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <FaNodeJs
          size={180}
          color='green'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <FaHtml5
          size={180}
          color='#CD331D'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <FaCss3
          size={180}
          color='#094FA8'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <FaGitAlt
          size={180}
          color='red'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <FaReact
          size={180}
          color='#53D3FA'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <SiNextdotjs
          size={180}
          color='black'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <FaAngular
          size={180}
          color='#CD1624'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <SiMongodb
          size={180}
          color='#1EE64F'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <SiMysql
          size={180}
          color='#0C5F78'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
        <SiTailwindcss
          size={180}
          color='#30AEF7'
          className='w-full text-center mt-20 hover:animate-pulse'
        />
      </div>
    </div>
  );
};
