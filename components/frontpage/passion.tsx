import { Player } from '@lottiefiles/react-lottie-player';
import { FC } from 'react';

export const Passion: FC = () => {
  return (
    <div className='my-20'>
      <div className='text-center h-52 bg-buff'>
        <h1 className='text-white font-bold text-4xl py-10'>
          I&apos;m passionate about coding
        </h1>
      </div>
      <div className='md:mx-5 mx-32 shadow-2xl bg-gray-50 -mt-20 rounded-md hover:bg-gray-700 hover:text-white'>
        <div className='h-full'>
          <Player
            className=' max-w-sm'
            autoplay
            loop
            src='https://assets1.lottiefiles.com/packages/lf20_ngzwzxib.json'
          ></Player>
        </div>
        <p className='text-xl my-5 font-semibold md:px-5 px-14 py-10'>
          Self-motivated and goal-oriented team player with excellent
          communication skills and above all a curious learner, Im tech savey
          and most of my aquired skills are self-taught. committed to pursuing a
          long-term career in web development if you like what you see please
          contact me and let&apos;s build something amazing.
        </p>
      </div>
    </div>
  );
};
