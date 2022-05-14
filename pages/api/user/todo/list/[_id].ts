import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { dbConnect } from '../../../../../utils';
import { TodoList, Todo } from '../../../../../utils/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { listId, label } = req.body;

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'not authenticated' });
  } else {
    const { id } = session.user;

    switch (method) {
      case 'GET':
        {
          await dbConnect();

          const todoList = await TodoList.find({
            owner: id,
            $where: listId,
          }).populate('todos');
          if (!todoList) {
            return res.status(404).json({ message: 'List not found' });
          }
          res.status(200).json({ todoList });
        }
        break;
      case 'POST':
        {
          await dbConnect();
          console.log({ method, listId, label });

          let todoList = await TodoList.findById(listId);
          if (!todoList) {
            return res.status(404).json({ message: 'List not found' });
          } else {
            const newTodo = new Todo({
              label,
              listId,
            });
            await newTodo.save();

            todoList.todos = [...todoList.todos, newTodo._id];

            await todoList.save();

            res.status(201).json({ message: 'item added!' });
          }
        }
        break;
    }
  }
};

export default handler;
