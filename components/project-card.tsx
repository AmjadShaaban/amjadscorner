import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { FaGithub, FaGlobe } from 'react-icons/fa';
import { Project } from '../interfaces/interfaces';

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
      <CardActionArea>
        <CardMedia
          component='img'
          image={project.img}
          alt={project.title}
          width={263}
          height={168}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant='h5' component='h2'>
            {project.title}
          </Typography>
          <Typography>{project.text}</Typography>
          <Typography color='secondary'>{project.text2}</Typography>
        </CardContent>
        <CardActions>
          <Link href={project?.repoUrl || '#'}>
            <FaGithub />
          </Link>
          <Link href={project?.demoUrl || '#'}>
            <FaGlobe />
          </Link>
        </CardActions>
      </CardActionArea>
    </Card>
  );
};
