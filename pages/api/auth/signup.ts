import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '../../../utils/auth';
import dbConnect from '../../../utils/dbConnect';
import { User } from '../../../utils/models/users';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return;
  }
  const data = req.body;

  const { firstName, lastName, email, password } = data;

  await dbConnect();

  const hashedPassword = await hashPassword(password);

  const newUser = new User({
    firstName,
    lastName,
    email,
    password: hashedPassword,
  });
  await newUser.save();

  res.status(201).json({ message: 'user created!' });
};

export default handler;
