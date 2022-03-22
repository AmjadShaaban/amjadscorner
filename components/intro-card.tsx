import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { margin } from '@mui/system';
import Image from 'next/image';
import { FC } from 'react';

export const IntroCard: FC = () => {
  return (
    <Box sx={{ m: 2 }}>
      <img src='/amj-portfolio.jpg' width={480} height={320} />
      <Typography align='center' style={{ maxWidth: '36rem' }}>
        Self-motivated and goal-oriented team player with excellent
        communication skills and above all a curious learner, Im tech savey and
        most of my aquired skills are self-taught. I recently graduated from
        UPenn LPS Full Stack Coding Bootcamp and committed to pursuing a
        long-term career in web development, please take a look around check out
        my projects & if you like what you see please contact me.
      </Typography>
    </Box>
  );
};
