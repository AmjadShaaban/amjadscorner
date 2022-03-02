import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { Fade } from 'react-awesome-reveal';
import { JackInTheBox } from 'react-awesome-reveal';
import Particles from 'react-tsparticles';
import { IntroCard } from '../components/intro-card';
import Link from 'next/link';

const particlesOptions: any = {
  background: {
    color: {
      value: '#ffffff',
    },
  },
  fpsLimit: 120,
  particles: {
    color: {
      value: '#000000',
    },
    links: {
      color: '#000000',
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 0.5,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: 'none',
      enable: true,
      outMode: 'bounce',
      random: false,
      speed: 2,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 80,
    },
    opacity: {
      value: 0.5,
    },
    size: {
      random: true,
      value: 5,
    },
  },
  detectRetina: true,
};

const Home: NextPage = () => {
  const particlesInit = async (main: any) => {
    console.log(main);
  };

  const particlesLoaded = async (container: any) => {
    console.log(container);
  };
  return (
    <div className={styles.container}>
      <Particles
        id='tsparticles'
        init={particlesInit}
        loaded={particlesLoaded}
        options={particlesOptions}
      />
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

        <Fade className={styles.description}>
          <h3 className={styles.code}>Full-stack Developer</h3>
        </Fade>
        {/* <JackInTheBox>
          <IntroCard />
        </JackInTheBox> */}
        <Image src='/under_construction.png' width={300} height={200} />
        <Fade>
          <div className={styles.code}>
            Sorry, The page is constantly being updated, I'm doing it solo
            without a plan so everything ie being improvised and thought about
            on the spot which is mentally draining! Im a coder not a designer
            😅😂 here are 2 links <Link href='/dapp'>[Web3 Dapp]</Link> and a
            still WIP link to my <Link href='/projects'>[projects]</Link> page.
            all this was done Tuesday March 1st 2022.
          </div>
        </Fade>
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
