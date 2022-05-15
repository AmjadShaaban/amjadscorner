import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../utils';
import { Message } from '../../utils/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  switch (method) {
    case 'POST':
      {
        try {
          const { body } = req;
          await dbConnect();
          const newMessage = new Message(body);
          const saved = await newMessage.save();
          res.status(200).json(saved);
        } catch (error) {
          console.log(error);
          res.status(400).json({ message: 'Bad Request' });
        }
      }
      break;
    default: {
      try {
        await dbConnect();
        const messages = await Message.find();
        if (!messages) {
          res.status(404).json({ message: 'Resources not found' });
        }
        res.status(200).json({ messages });
      } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  }
};
export default handler;
