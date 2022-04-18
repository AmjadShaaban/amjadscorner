import type { NextPage } from 'next';
import { DevStack } from '../components/dev-stack';
import { Introduction } from '../components/introduction';
import { Layout } from '../components/layout';
import { Passion } from '../components/passion';
import { Technologies } from '../components/technologies';
import { WhoAmI } from '../components/who-am-i';

const Home: NextPage = () => {
  return (
    <Layout>
      <div>
        {/* introduction */}
        <Introduction />
        {/* techs */}
        <Technologies />
        {/* passion */}
        <Passion />
        {/* dev stack */}
        <DevStack />
        {/* dev info */}
        <WhoAmI />
      </div>
    </Layout>
  );
};

export default Home;
