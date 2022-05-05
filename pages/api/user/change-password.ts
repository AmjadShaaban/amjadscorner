import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { hashPassword, verifyPassword } from '../../../utils/auth';
import dbConnect from '../../../utils/dbConnect';
import { User } from '../../../utils/models/users';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { oldPassword, newPassword } = req.body;

  switch (method) {
    case 'PATCH':
      {
        const session = await getSession({ req: req });
        if (!session) {
          res.status(401).json({ message: 'not authenticated' });
          return;
        }
        const { email } = session.user;
        await dbConnect();
        const user = await User.findOne({ email });
        if (!user) {
          res.status(404).json({ message: 'User not found!' });
          return;
        }
        const currentPassword = user.password;
        const passwordsAreEqual = verifyPassword(oldPassword, currentPassword);
        if (!passwordsAreEqual) {
          res.status(422).json({ message: `Passwords don't match` });
          return;
        }
        const hashedPassword = await hashPassword(newPassword);

        const result = await User.updateOne(
          { email },
          { $set: { password: hashedPassword } }
        );

        res.status(200).json({ message: 'Password Updated' });
      }
      break;
    default: {
      return;
    }
  }
};

export default handler;
