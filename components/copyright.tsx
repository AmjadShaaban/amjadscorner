import Link from 'next/link';
import Image from 'next/image';

export const Copyright = () => {
  return (
    <div>
      <p className='text-center'>
        Built with
        <Link href='https://nextjs.org/'>
          <Image src='/nextjs.svg' alt='NextJS Logo' width={50} height={23} />
        </Link>
        Powered by
        <Link href='https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app'>
          <Image src='/vercel.svg' alt='Vercel Logo' width={72} height={16} />
        </Link>
      </p>
      <p className='text-center'>
        {'Copyright © '}
        <Link href='https://amjadscorner.us/'>Amjad&apos;s Corner</Link>{' '}
        {new Date().getFullYear()}
        {'.'}
      </p>
    </div>
  );
};
