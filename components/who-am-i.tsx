import { FC } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

export const WhoAmI: FC = () => {
  return (
    <div>
      <div className='h-screen relative'>
        <h1 className='text-4xl text-gray-500 text-center font-bold'>
          Who am I?
        </h1>
        <Player
          className='h-1/2'
          autoplay
          loop
          src='https://assets2.lottiefiles.com/packages/lf20_gja1z1ru.json'
          style={{ height: '500px', width: '500px' }}
        >
          <div className='absolute top-52 right-0 left-0 bottom-0 flex flex-col items-center'>
            <pre>
              {JSON.stringify(
                {
                  name: 'Amjad Shaaban',
                  age:
                    new Date().getFullYear() -
                    new Date('July 8, 1983').getFullYear(),
                  gender: 'Male',
                  country: 'USA',
                },
                null,
                2
              )}
            </pre>
          </div>
        </Player>
      </div>
    </div>
  );
};