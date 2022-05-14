import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { dbConnect } from '../../../../utils';
import { TodoList } from '../../../../utils/models/todo-lists';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { label } = req.body;

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'not authenticated' });
  } else {
    const { id } = session?.user;

    switch (method) {
      case 'POST':
        {
          await dbConnect();

          const newTodoList = new TodoList({
            label,
            owner: id,
          });
          await newTodoList.save();
          res.status(201).json({ message: 'list created!' });
        }
        break;
      case 'GET':
        {
          await dbConnect();

          const todoLists = await TodoList.find({ owner: id }).populate(
            'todos'
          );
          if (!todoLists) {
            return res.status(404).json({ message: 'Resources not found' });
          }
          res.status(200).json({ todoLists });
        }
        break;
    }
  }
};

export default handler;
