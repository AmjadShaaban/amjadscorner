import { FC } from 'react';
import { Project } from '../interfaces/interfaces';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import { FaGithub } from 'react-icons/fa';

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
        sx={{
          // 16:9
          pt: '56.25%',
        }}
        image={project.img}
        alt='random'
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant='h5' component='h2'>
          {project.title}
        </Typography>
        <Typography>{project.text}</Typography>
        <Typography>{project.text2}</Typography>
      </CardContent>
      <CardActions>
        <Button size='small'>
          <FaGithub />
        </Button>
        <Button size='small'>DEMO</Button>
      </CardActions>
    </Card>
  );
};
