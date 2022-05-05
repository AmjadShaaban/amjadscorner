import { FC } from 'react';
import { Tooltip } from 'react-tippy';

import { ICONS_DATA } from '../data';

export const Technologies: FC = () => {
  return (
    <div className='mt-20'>
      <h1 className='text-4xl text-blue-800 font-bold text-center my-8'>
        Technologies I Use
      </h1>
      <div className='grid md:grid-cols-1 grid-cols-4'>
        {ICONS_DATA.map((item) => {
          const { icon } = item;
          return (
            <Tooltip key={item.title} title={item.title} position='bottom'>
              {icon}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
