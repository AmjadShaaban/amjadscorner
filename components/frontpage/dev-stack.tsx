import { Player } from "@lottiefiles/react-lottie-player";
import { FC } from "react";

const devStack = [
  {
    title: "Languages",
    items: ["Typescript", "Javascript", "HTML/CSS"],
  },
  {
    title: "Frameworks",
    items: ["React JS", "Next JS", "Angular"],
  },
  {
    title: "Back End & DB",
    items: ["ExpressJS", "NestJS", "MySQL", "MongoDB"],
  },
];

export const DevStack: FC = () => {
  return (
    <></>
    // <div className='my-20'>
    //   <div className='text-center h-52 bg-orange-400'>
    //     <h1 className='text-white font-bold text-4xl py-10'>My Dev Stack</h1>
    //   </div>
    //   <div className='md:mx-5 mx-32 shadow-2xl bg-gray-50 -mt-20 rounded-md hover:bg-gray-700 hover:text-white'>
    //     <div className='h-full'>
    //       <Player
    //         className=' max-w-sm'
    //         autoplay
    //         loop
    //         src='https://assets4.lottiefiles.com/packages/lf20_ge4hzqpv.json'
    //       ></Player>
    //     </div>
    //     <div className='grid md:grid-cols-1 grid-cols-3 p-5'>
    //       {devStack.map((col, idx) => (
    //         <div
    //           key={col.title}
    //           className={`${
    //             idx === 0 ? '' : idx === 1 ? 'text-center' : 'text-right'
    //           }`}
    //         >
    //           <h1 className='text-xl font-bold'>{col.title}</h1>
    //           <hr />
    //           {col.items.map((item) => (
    //             <p key={item} className='font-semibold mt-2'>
    //               {item}
    //             </p>
    //           ))}
    //         </div>
    //       ))}
    //     </div>
    //   </div>
    // </div>
  );
};
