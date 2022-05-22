import { NextPage } from 'next';
import { Layout } from '../components/layout';
import { useAlert } from 'react-alert';

const TestPage: NextPage = () => {
  const alert = useAlert();
  return (
    <Layout>
      <button
        className='border-2'
        onClick={() => {
          alert.show('A Show Alert!!!');
        }}
      >
        Show
      </button>
      <button
        className='border-2'
        onClick={() => {
          alert.success('A Success Alert!!!');
        }}
      >
        Success
      </button>
      <button
        className='border-2'
        onClick={() => {
          alert.error('An Error Alert!!!');
        }}
      >
        Error
      </button>
      <button
        className='border-2'
        onClick={() => {
          alert.info('An Info Alert!!!');
        }}
      >
        Info
      </button>
    </Layout>
  );
};

export default TestPage;
