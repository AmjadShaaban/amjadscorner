import Box from '@mui/material/Box';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { AttentionSeeker } from 'react-awesome-reveal';
import { Footer } from '../components/footer';
import { IntroCard } from '../components/intro-card';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Amjad&apos;s Portfolio</title>
        <meta name='description' content="Amjad's Portfolio" />
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <Box className={styles.main}>
        <h1 className={styles.title}>
          Hello, I&apos;m{' '}
          <a href='https://github.com/AmjadShaaban'>Amjad Shaaban</a>
        </h1>
        <h3 className={styles.code}>Junior Software Engineer</h3>
        <IntroCard />
        <AttentionSeeker effect='heartBeat'>
          <Image src='/under_construction.png' width={300} height={200} />
        </AttentionSeeker>
      </Box>
      <Footer />
    </>
  );
};

export default Home;
