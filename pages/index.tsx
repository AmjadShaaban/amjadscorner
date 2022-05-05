import type { NextPage } from 'next';
import {
  DevStack,
  Introduction,
  Layout,
  Passion,
  Technologies,
  WhoAmI,
} from '../components';

const Home: NextPage = () => {
  return (
    <Layout>
      <Introduction />
      <Technologies />
      <Passion />
      <DevStack />
      <WhoAmI />
    </Layout>
  );
};

export default Home;
