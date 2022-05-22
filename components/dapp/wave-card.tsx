import { FC } from 'react';

interface Wave {
  address?: string;
  message: string;
  timestamp: Date;
}

export const WaveCard: FC<{ wave: Wave }> = ({ wave }) => {
  return (
    <div>
      <h1>{wave.address}</h1>
      <p>{wave.message}</p>
    </div>
  );
};
