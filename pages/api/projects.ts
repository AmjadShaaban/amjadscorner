import dbConnect from '../../utils/dbConnect';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Project } from '../../utils/models/projects';

const projects = [
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
  {
    title: 'CARD TITLE',
    text: 'This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.',
    text2: 'Last updated 3 mins ago',
    img: '/270x100.png',
  },
];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await dbConnect();
    const newProject = new Project(projects[0]);
    const saved = await newProject.save();
    res.status(200).json(saved);
  } catch (error) {
    console.log(error);
    res.status(500).send('error');
  }
}
