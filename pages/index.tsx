import { Player } from '@lottiefiles/react-lottie-player';
import type { NextPage } from 'next';
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
import { Layout } from '../components/layout';
import { WhoAmI } from '../components/who-am-i';

const devStack = [
  {
    title: 'Languages',
    items: ['Typescript', 'Javascript', 'HTML/CSS'],
  },
  {
    title: 'Frameworks',
    items: ['React JS', 'Next JS', 'Angular'],
  },
  {
    title: 'Back End & DB',
    items: ['NodeJS', 'ExpressJS', 'NestJS', 'MySQL', 'MongoDB'],
  },
];

const Home: NextPage = () => {
  return (
    <Layout>
      <div>
        {/* introduction */}
        <div className='bg-theme h-screen'>
          <div className='grid bg-theme md:grid-cols-1 grid-cols-2 h-full items-center border-4 md:border-0 mx-10 border-white transform rotate-12 md:rotate-0'>
            <Player
              className='h-1/2'
              autoplay
              loop
              src='https://assets2.lottiefiles.com/private_files/lf30_obidsi0t.json'
            ></Player>
            <div className='text-bold text-white px-5'>
              <h1 className='text-7xl md:text-4xl'>
                Hi, I&apos;m <b className='text-orange-500'>AMJAD</b>
              </h1>
              <h1 className='text-4xl md:text-xl'>
                FullStack <b className='text-red-500'>Developer</b>
              </h1>
            </div>
          </div>
        </div>

        {/* techs */}
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
        {/* passion */}
        <div className='my-20'>
          <div className='text-center h-52 bg-buff'>
            <h1 className='text-white font-bold text-4xl py-10'>
              I&apos;m passionate about coding
            </h1>
          </div>
          <div className='md:mx-5 mx-32 shadow-2xl bg-gray-50 -mt-20 rounded-md hover:bg-gray-700 hover:text-white'>
            <div>
              <Player
                autoplay
                loop
                src='https://assets1.lottiefiles.com/packages/lf20_ngzwzxib.json'
                style={{ height: '300px', width: '300px' }}
              ></Player>
            </div>
            <p className='text-xl my-5 font-semibold md:px-5 px-14 py-10'>
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Optio
              dolor modi repellendus exercitationem esse, facilis reiciendis
              incidunt, dicta, quibusdam officiis voluptatem dolorem porro at
              quod culpa aliquam? Ea, voluptatum similique!
            </p>
          </div>
        </div>
        {/* dev stack */}
        <div className='my-20'>
          <div className='text-center h-52 bg-orange-400'>
            <h1 className='text-white font-bold text-4xl py-10'>
              My Dev Stack
            </h1>
          </div>
          <div className='md:mx-5 mx-32 shadow-2xl bg-gray-50 -mt-20 rounded-md hover:bg-gray-700 hover:text-white'>
            <div>
              <Player
                autoplay
                loop
                src='https://assets4.lottiefiles.com/packages/lf20_ge4hzqpv.json'
                style={{ height: '300px', width: '300px' }}
              ></Player>
            </div>
            <div className='grid md:grid-cols-1 grid-cols-3 p-5'>
              {devStack.map((col, idx) => (
                <div
                  key={col.title}
                  className={`${
                    idx === 0 ? '' : idx === 1 ? 'text-center' : 'text-right'
                  }`}
                >
                  <h1 className='text-xl font-bold'>{col.title}</h1>
                  <hr />
                  {col.items.map((item) => (
                    <p className='font-semibold mt-2'>{item}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* dev info */}
        <WhoAmI />
      </div>
    </Layout>
  );
};

export default Home;
