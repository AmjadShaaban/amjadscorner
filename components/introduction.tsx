import { FC } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

export const Introduction: FC = () => {
  return (
    <div className='bg-theme h-screen'>
      <div className='grid bg-theme md:grid-cols-1 grid-cols-2 h-full items-center border-4 md:border-0 mx-10 border-white transform rotate-12 md:rotate-0'>
        <div className='h-full'>
          <Player
            className='h-1/2 md:h-80'
            autoplay
            loop
            src='https://assets2.lottiefiles.com/private_files/lf30_obidsi0t.json'
          ></Player>
        </div>
        <div className='text-bold text-white px-5 md:text-center'>
          <h1 className='text-7xl md:text-4xl'>
            Hi, I&apos;m <b className='text-orange-500'>AMJAD</b>
          </h1>
          <h1 className='text-4xl md:text-xl'>
            FullStack <b className='text-red-500'>Developer</b>
          </h1>
        </div>
      </div>
    </div>
  );
};
