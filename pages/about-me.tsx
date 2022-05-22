import { NextPage } from 'next';
import { Tooltip } from 'react-tippy';
import { Layout } from '../components/layout';
const title = 'THE TIP TITLE';
const AboutMe: NextPage = () => {
  return (
    <Layout>
      <Tooltip title={title}>
        <>About Me</>
      </Tooltip>
    </Layout>
  );
};

export default AboutMe;
