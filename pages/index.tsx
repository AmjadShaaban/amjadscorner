import { Typography } from '@mui/material';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import type { NextPage } from 'next';
import Head from 'next/head';
import Image from 'next/image';
import { AttentionSeeker, Fade, JackInTheBox } from 'react-awesome-reveal';
// import Particles from 'react-tsparticles';
import { Footer } from '../components/footer';
import { IntroCard } from '../components/intro-card';
import styles from '../styles/Home.module.css';

// const particlesOptions: any = {
//   background: {
//     color: {
//       value: '#ffffff',
//     },
//   },
//   fpsLimit: 120,
//   particles: {
//     color: {
//       value: '#000000',
//     },
//     links: {
//       color: '#000000',
//       distance: 150,
//       enable: true,
//       opacity: 0.5,
//       width: 0.5,
//     },
//     collisions: {
//       enable: true,
//     },
//     move: {
//       direction: 'none',
//       enable: true,
//       outMode: 'bounce',
//       random: false,
//       speed: 2,
//       straight: false,
//     },
//     number: {
//       density: {
//         enable: true,
//         area: 800,
//       },
//       value: 80,
//     },
//     opacity: {
//       value: 0.5,
//     },
//     size: {
//       random: true,
//       value: 5,
//     },
//   },
//   detectRetina: true,
// };

const Home: NextPage = () => {
  // const particlesInit = async (main: any) => {
  //   console.log(main);
  // };

  // const particlesLoaded = async (container: any) => {
  //   console.log(container);
  // };
  return (
    <>
      {/* <div className={styles.container}>
        <Particles
          style={{ zIndex: -1 }}
          id='tsparticles'
          init={particlesInit}
          loaded={particlesLoaded}
          options={particlesOptions}
        />
      </div> */}

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
        <Paper
          elevation={6}
          style={{ zIndex: 2, alignItems: 'center', justifyContent: 'center' }}
        >
          <JackInTheBox>
            <IntroCard />
          </JackInTheBox>
          <AttentionSeeker effect='heartBeat'>
            <Image src='/under_construction.png' width={300} height={200} />
          </AttentionSeeker>
          <Typography align='center'>
            <Link href='/projects' underline='hover'>
              My Projects
            </Link>
          </Typography>
          <Footer />
        </Paper>
      </Container>
    </>
  );
};

export default Home;
