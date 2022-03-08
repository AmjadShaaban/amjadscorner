import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';
import { Fade } from 'react-awesome-reveal';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import Link from '@mui/material/Link';
import Container from '@mui/material/Container';
import { JackInTheBox } from 'react-awesome-reveal';
import Particles from 'react-tsparticles';
import { IntroCard } from '../components/intro-card';

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
    <>
      <div className={styles.container}>
        <Particles
          style={{ zIndex: -1 }}
          id='tsparticles'
          init={particlesInit}
          loaded={particlesLoaded}
          options={particlesOptions}
        />
      </div>

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
          <h3 className={styles.code}>Full-stack Developer</h3>
        </Fade>
        <Image src='/amj-portfolio.jpg' width={480} height={320} />
        <JackInTheBox>
          <IntroCard />
        </JackInTheBox>
        <Paper elevation={6} style={{ zIndex: 2, maxWidth: '36rem' }}>
          <Image src='/under_construction.png' width={300} height={200} />
          <List>
            <ListItem>
              <Link href='/blog' underline='hover'>
                Blog
              </Link>
            </ListItem>
            <ListItem>
              <Link href='/projects' underline='hover'>
                Projects
              </Link>
            </ListItem>
            <ListItem>
              <Link href='/dapp' underline='hover'>
                DAPP
              </Link>
            </ListItem>
          </List>
          <Button variant='outlined'>View my work</Button>
        </Paper>
      </Container>

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
    </>
  );
};

export default Home;
