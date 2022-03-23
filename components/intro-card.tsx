import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import Link from '@mui/material/Link';

export const IntroCard: FC = () => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardMedia
        component='img'
        height='210'
        image='/amj-portfolio.jpg'
        alt='Amjad Shaaban'
      />
      <CardContent>
        <Typography gutterBottom variant='h5' component='div'>
          About me:
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Self-motivated and goal-oriented team player with excellent
          communication skills and above all a curious learner, Im tech savey
          and most of my aquired skills are self-taught. I recently graduated
          from UPenn LPS Full Stack Coding Bootcamp and committed to pursuing a
          long-term career in web development, please take a look around check
          out my projects & if you like what you see please contact me.
        </Typography>
      </CardContent>
      <CardActions>
        <Link href='/projects' underline='hover'>
          My Projects
        </Link>
      </CardActions>
    </Card>
  );
};
