import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { Fade } from 'react-awesome-reveal';
import Typewriter from 'typewriter-effect';
import Button from 'react-bootstrap/Button';
import { JackInTheBox } from 'react-awesome-reveal';

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Amjad&apos;s Portfolio</title>
        <meta name='description' content="Amjad's Portfolio" />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className={styles.main}>
        <Fade>
          <h1 className={styles.title}>
            Hello, I&apos;m{' '}
            <a href='https://github.com/AmjadShaaban'>Amjad Shaaban</a>
          </h1>
        </Fade>

        <p className={styles.description}>
          <p className={styles.code}>
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .typeString(
                    'Full stack TypeScript/JavaScript Web/App Developer'
                  )
                  .changeDelay(20)
                  .start();
              }}
            />
          </p>
        </p>
        <JackInTheBox delay={8000}>
          <Button variant='primary'>[PH]ENTER</Button>
        </JackInTheBox>
      </main>

      <footer className={styles.footer}>
        <a
          href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'
          target='_blank'
          rel='noopener noreferrer'
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  );
};

export default Home;
