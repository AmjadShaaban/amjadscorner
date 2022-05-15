import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { dbConnect } from '../../../../../utils';
import { Todo, TodoList } from '../../../../../utils/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { listId, label } = req.body;
  const { _id } = req.query;

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

          // const todoList = await TodoList.findById(listId);
          // if (!todoList) {
          //   return res.status(404).json({ message: 'List not found' });
          // } else {
          const newTodo = new Todo({
            label,
            listId,
          });
          await newTodo.save();
          await TodoList.findByIdAndUpdate(
            { _id: listId },
            { $push: { todos: newTodo } }
          );

          res.status(201).json({ message: 'item added!' });
          // }
        }
        break;
      case 'DELETE': {
        try {
          await dbConnect();
          const todoList = await TodoList.findByIdAndDelete({ _id });
          if (!todoList) {
            return res.status(404).json({ message: 'List not found' });
          }
          await Todo.deleteMany({ listId: _id });
          return res.status(201).json({ message: 'Item Deleted' });
        } catch (error) {
          return res.status(500).json({ error });
        }
      }
    }
  }
};

export default handler;
