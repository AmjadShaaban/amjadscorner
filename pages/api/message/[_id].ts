import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../utils';
import { Message } from '../../../utils/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;

  switch (method) {
    case 'DELETE':
      {
        try {
          const { _id } = req.query;
          await dbConnect();
          const response = await Message.deleteOne({ _id });
          if (response) {
            res.status(200).json({ message: `Message id: ${_id} deleted` });
          }
        } catch (error) {
          res.status(500).json(error);
        }
      }
      break;
    default: {
      return;
    }
  }
};

export default handler;
