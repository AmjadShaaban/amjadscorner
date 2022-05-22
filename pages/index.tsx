import type { NextPage } from 'next';
import {
  DevStack,
  Introduction,
  Passion,
  Technologies,
  WhoAmI,
} from '../components/frontpage';
import { Layout } from '../components/layout';

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
