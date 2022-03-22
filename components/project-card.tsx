import { FC } from 'react';
import { Project } from '../interfaces/interfaces';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import { FaGithub, FaGlobe } from 'react-icons/fa';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardMedia
        component='img'
        image={project.img}
        alt='random'
        width={263}
        height={168}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant='h5' component='h2'>
          {project.title}
        </Typography>
        <Typography>{project.text}</Typography>
        <Typography>{project.text2}</Typography>
      </CardContent>
      <CardActions>
        <Link href={project?.repoUrl || '#'}>
          <FaGithub />
        </Link>
        <Link href={project?.demoUrl || '#'}>
          <FaGlobe />
        </Link>
      </CardActions>
    </Card>
  );
};
