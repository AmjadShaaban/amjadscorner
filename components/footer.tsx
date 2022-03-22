import { FC } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Image from 'next/image';
import { FaGithub, FaGlobe, FaLinkedin } from 'react-icons/fa';

function Copyright() {
  return (
    <Typography variant='body2' color='text.secondary' align='center'>
      {'Copyright © '}
      <Link color='inherit' href='https://amjadscorner.us/'>
        Amjad&apos;s Corner
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export const Footer: FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.paper', p: 6 }} component='footer'>
      <Typography variant='h6' align='center' gutterBottom>
        <Link href='https://github.com/AmjadShaaban'>
          <FaGithub />
        </Link>
        <Link href='https://amjadscorner.us'>
          <FaGlobe />
        </Link>
        <Link href='https://www.linkedin.com/in/amjadshaaban/'>
          <FaLinkedin />
        </Link>
      </Typography>
      <Typography
        variant='subtitle1'
        align='center'
        color='text.secondary'
        component='p'
      >
        Let&apos;s build something amazing!
      </Typography>
      <Typography
        variant='subtitle1'
        align='center'
        color='text.secondary'
        component='p'
      >
        Built with
        <Link href='https://nextjs.org/'>
          <Image src='/nextjs.svg' alt='NextJS Logo' width={50} height={23} />
        </Link>
        Powered by
        <Link href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'>
          <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
        </Link>
      </Typography>
      <Copyright />
    </Box>
  );
};
