import Link from 'next/link';
import React, { FC } from 'react';
import Card from 'react-bootstrap/Card';

export const IntroCard: FC<{}> = ({}) => {
  return (
    <Card style={{ width: '28rem' }}>
      <Card.Body>
        <Card.Img src='/amj-portfolio.jpg' />
        <Card.Text>
          Junior Full-stack Developer, Self motivated team player with excellent
          communication skills. Passionate Tech savvy gamer with a lot of love
          for coding (open to any language). Mainly JavaScript/TypeScript
          experianced but i studied Jave, C, C++ in school. currently learning
          web3 apps and how to develop smart contracts using Solidity on the
          Ethereum blockchain. Check out my work and drop by say Hi.
        </Card.Text>
      </Card.Body>
      <Card.Footer className='text-muted'>
        <Link href='/portfolio'>View my work -{'>'}</Link>
      </Card.Footer>
    </Card>
  );
};
