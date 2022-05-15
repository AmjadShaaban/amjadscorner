import type { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../utils';
import { Project } from '../../utils/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  switch (method) {
    case 'POST':
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
      break;
    default:
      try {
        await dbConnect();
        const projects = await Project.find();
        if (!projects) {
          res.status(404).json({ message: 'Resourses not found' });
        }
        res.status(200).json({ projects });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
  }
}
