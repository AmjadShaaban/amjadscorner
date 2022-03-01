import React from 'react';
import Card from 'react-bootstrap/Card';

interface Wave {
  address?: string;
  message: string;
  timestamp: Date;
}

export const WaveCard = ({ wave }: { wave: Wave }) => {
  return (
    <Card bg='light' style={{ width: '20rem' }} className='text-muted'>
      <Card.Header>From: {wave.address}</Card.Header>
      <Card.Body className='text-dark'>{wave.message}</Card.Body>
      <Card.Footer className='text-muted'>
        On: {wave.timestamp.toString()}
      </Card.Footer>
    </Card>
  );
};
