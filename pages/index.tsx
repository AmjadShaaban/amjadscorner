import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { Fade } from 'react-awesome-reveal';
import Button from 'react-bootstrap/Button';
import { JackInTheBox } from 'react-awesome-reveal';
import Particles from 'react-tsparticles';
import Engine from 'react-tsparticles';
import { FaEthereum, FaReact, FaBootstrap } from 'react-icons/fa';

const particlesOptions: any = {
  background: {
    color: {
      value: '#ffffff',
    },
  },
  fpsLimit: 120,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'repulse',
      },
      resize: true,
    },
    modes: {
      bubble: {
        distance: 400,
        duration: 2,
        opacity: 0.8,
        size: 40,
      },
      push: {
        quantity: 4,
      },
      repulse: {
        distance: 200,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#000000',
    },
    links: {
      color: '#000000',
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: 'none',
      enable: true,
      outMode: 'bounce',
      random: false,
      speed: 6,
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
    shape: {
      character: {
        fill: true,
        font: 'Font Awesome 5 Brands',
        style: '',
        value: () => FaReact,
        weight: '400',
      },
    },
    size: {
      random: true,
      value: 5,
    },
  },
  detectRetina: true,
};

const Home: NextPage = () => {
  const particlesInit = (main) => {
    console.log(main);
  };

  const particlesLoaded = (container: any) => {
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
