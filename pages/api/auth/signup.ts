import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '../../../utils';
import { dbConnect } from '../../../utils';
import { User } from '../../../utils/models';

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
