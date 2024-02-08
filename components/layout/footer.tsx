import Link from "next/link";
import { FC } from "react";
import {
  FaGithub,
  FaGlobeAmericas,
  FaLinkedin,
  FaMailBulk,
} from "react-icons/fa";
import { SiNextdotjs, SiVercel } from "react-icons/si";

export const Footer: FC = () => {
  return (
    <></>
    // <div className='bg-theme flex justify-center'>
    //   <div className='md:w-full w-1/2'>
    //     <div className=' p-10 text-center'>
    //       <p className='text-gray-50 pb-5'>Designed and Developed by</p>
    //       <div className='h-1 border-2 border-white border-dotted'></div>
    //       <div className='flex text-white w-full justify-between py-3'>
    //         <Link href='https://github.com/AmjadShaaban'>
    //           <FaGithub className=' cursor-pointer' />
    //         </Link>
    //         <Link href='https://www.linkedin.com/in/amjadshaaban/'>
    //           <FaLinkedin className=' cursor-pointer' />
    //         </Link>
    //         <Link href='https://www.amjadscorner.us'>
    //           <FaGlobeAmericas className=' cursor-pointer' />
    //         </Link>
    //         <Link href='mailto:amjadscorner@gmail.com'>
    //           <FaMailBulk className=' cursor-pointer' />
    //         </Link>
    //       </div>
    //       <div className='h-1 border-2 border-white border-dotted'></div>
    //       <p className='text-gray-50 pt-5'>
    //         Amjad Shaaban © {new Date().getFullYear()}
    //       </p>
    //       <div className='flex text-white w-full justify-center'>
    //         <p className='flex'>
    //           Built with&nbsp;
    //           <Link href='https://nextjs.org/'>
    //             <SiNextdotjs className=' cursor-pointer' />
    //           </Link>
    //           &nbsp;Next.js, Powered by&nbsp;
    //           <Link href='https://vercel.com/'>
    //             <SiVercel className=' cursor-pointer' />
    //           </Link>
    //           &nbsp;Vercel.
    //         </p>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};
