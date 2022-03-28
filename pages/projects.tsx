import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';
import { Footer } from '../components/footer';
import { ProjectCard } from '../components/project-card';
import { useGetProjects } from '../utils/hooks/api-hooks';

export default function Album() {
  const { data: projectsResponse } = useGetProjects();

  const data = useMemo(
    () => projectsResponse?.projects ?? [],
    [projectsResponse?.projects]
  );
  return (
    <>
      <CssBaseline />
      <main>
        <Box
          sx={{
            bgcolor: 'background.paper',
            pt: 8,
            pb: 6,
          }}
        >
          <Container maxWidth='sm'>
            <Typography
              component='h1'
              variant='h2'
              align='center'
              color='text.primary'
              gutterBottom
            >
              My Projects
            </Typography>
            <Typography
              variant='h5'
              align='center'
              color='text.secondary'
              paragraph
            >
              Here&apos;s a list of projects i worked on and little apps i did
              to demonstrate my abilities. look around and check them out. Any
              constructive critisism is greatly appreciated.{' '}
              <Link href='/api-json'>Click here</Link> For the JSON from the API
            </Typography>
          </Container>
        </Box>
        <Container sx={{ py: 8 }} maxWidth='md'>
          <Grid container spacing={4}>
            {data.map((project) => (
              <Grid item key={project._id} xs={12} sm={6} md={4}>
                <ProjectCard project={project} />
              </Grid>
            ))}
          </Grid>
        </Container>
      </main>
      <Footer />
    </>
  );
}
