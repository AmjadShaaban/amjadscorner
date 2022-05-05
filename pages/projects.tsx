import { Player } from '@lottiefiles/react-lottie-player';
import { NextPage } from 'next';
import Image from 'next/image';
import { Layout } from '../components';
import { useGetProjects } from '../utils/hooks';
import { FaGithub } from 'react-icons/fa';

const Projects: NextPage = () => {
  const { data: progjectsData, isFetching: loading } = useGetProjects();
  return (
    <Layout>
      <div className='mt-20'>
        <div>
          <Player
            className='max-w-lg'
            autoplay
            loop
            src='https://assets10.lottiefiles.com/packages/lf20_8zzfnwv8.json'
          ></Player>
          <div className='mx-20 p-20'>
            <p className=' text-xl font-semibold text-center'>
              &quot;Any fool can write code that a computer can understand. Good
              programmers write code that humans can understand.&quot;
            </p>
            <h3 className='text-right'> - Martin Fowler</h3>
          </div>
          <div className=' mx-20 p-20'>
            <div className=' text-center font-bold text-4xl'>
              &quot;Knowledge is power.&quot;
            </div>
            <h3 className=' text-right'> - Francis Bacon</h3>
          </div>
          <div className=' text-center bg-orange-500 mx-20 p-20 text-white rounded-tl-full rounded-br-full md:mx-5'>
            <h1 className=' text-7xl  font-bold md:text-3xl'>
              &quot;First, solve the problem.
            </h1>
            <h1 className=' text-7xl  font-bold md:text-3xl'>
              Then, write the code.&quot;
            </h1>
            <h3 className=' text-right mr-24'> - John Johnson</h3>
          </div>
        </div>
      </div>
      <div className=' grid grid-cols-3 md:grid-cols-1 items-center justify-center mt-20 gap-10 mx-20 md:mx-5'>
        {progjectsData?.projects?.map((project) => (
          <div
            key={project._id}
            className=' relative p-10 border-2 text-center rounded-br-3xl rounded-tl-3xl border-gray-400'
          >
            <Image
              src={project.img}
              className=' w-full h-52 text-center'
              width={220}
              height={220}
            />
            <div className=' absolute inset-0 flex flex-col justify-center items-center bg-black opacity-0 hover:opacity-80 rounded-br-3xl rounded-tl-3xl'>
              <h1 className=' text-4xl font-semibold text-white'>
                {project.title}
              </h1>
              <button className=' border-2 border-white rounded text-white w-12'>
                <FaGithub className=' text-white' />
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Projects;

// export default function Album() {
//   const { data: projectsResponse } = useGetProjects();

//   const data = useMemo(
//     () => projectsResponse?.projects ?? [],
//     [projectsResponse?.projects]
//   );
//   return (
//     <>
//       <CssBaseline />
//       <main>
//         <Box
//           sx={{
//             bgcolor: 'background.paper',
//             pt: 8,
//             pb: 6,
//           }}
//         >
//           <Container maxWidth='sm'>
//             <Typography
//               component='h1'
//               variant='h2'
//               align='center'
//               color='text.primary'
//               gutterBottom
//             >
//               My Projects
//             </Typography>
//             <Typography
//               variant='h5'
//               align='center'
//               color='text.secondary'
//               paragraph
//             >
//               Here&apos;s a list of projects i worked on and little apps i did
//               to demonstrate my abilities. look around and check them out. Any
//               constructive critisism is greatly appreciated.{' '}
//               <Link href='/api-json'>Click here</Link> For the JSON from the API
//             </Typography>
//           </Container>
//         </Box>
//         <Container sx={{ py: 8 }} maxWidth='md'>
//           <Grid container spacing={4}>
//             {data.map((project) => (
//               <Grid item key={project._id} xs={12} sm={6} md={4}>
//                 <ProjectCard project={project} />
//               </Grid>
//             ))}
//           </Grid>
//         </Container>
//       </main>
//       <Footer />
//     </>
//   );
// }
