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
  if (req.method === 'POST') {
    try {
      const { body } = req;
      await dbConnect();
      console.log('BODY:', req.body);
      const newProject = new Project(body);
      const saved = await newProject.save();
      res.status(200).json(saved);
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Bad Request' });
    }
  } else if (req.method === 'GET') {
    try {
      await dbConnect();
      const response = await Project.find({});
      if (!response) {
        res.status(404).json({ message: 'Resourses not found' });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }
}
