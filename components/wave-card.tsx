import { CardActionArea } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import React, { FC } from 'react';
interface Wave {
  address?: string;
  message: string;
  timestamp: Date;
}

export const WaveCard: FC<{ wave: Wave }> = ({ wave }) => {
  return (
    <Card sx={{ maxWidth: 345 }}>
      <CardActionArea>
        <CardMedia
          component='img'
          height='140'
          image='/static/images/cards/contemplative-reptile.jpg'
          alt='green iguana'
        />
        <CardContent>
          <Typography gutterBottom variant='h5' component='div'>
            {wave.address}
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            {wave.message}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
};
