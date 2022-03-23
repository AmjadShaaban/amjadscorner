import { Typography } from '@mui/material';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { AttentionSeeker, Fade, JackInTheBox } from 'react-awesome-reveal';
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
      <Container className={styles.main}>
        <Fade>
          <h1 className={styles.title}>
            Hello, I&apos;m{' '}
            <a href='https://github.com/AmjadShaaban'>Amjad Shaaban</a>
          </h1>
        </Fade>
        <Fade className={styles.description}>
          <h3 className={styles.code}>Junior Software Engineer</h3>
        </Fade>
        <JackInTheBox>
          <IntroCard />
        </JackInTheBox>
        <AttentionSeeker effect='heartBeat'>
          <Image src='/under_construction.png' width={300} height={200} />
        </AttentionSeeker>
        <Footer />
      </Container>
    </>
  );
};

export default Home;
