import type { NextApiRequest, NextApiResponse } from 'next';

const projects = [
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({ projects });
}
