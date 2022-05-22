import { Player } from '@lottiefiles/react-lottie-player';
import { NextPage } from 'next';
import { Layout } from '../components/layout';

const FourZeroFour: NextPage = () => {
  return (
    <Layout>
      <div className=' h-fit'>
        <div>
          <Player
            className='max-w-xs'
            autoplay
            loop
            src='https://assets5.lottiefiles.com/packages/lf20_GIyuXJ.json'
          ></Player>
        </div>
        <div className='text-6xl font-bold text-center'>PAGE NOT FOUND</div>
      </div>
    </Layout>
  );
};

export default FourZeroFour;
