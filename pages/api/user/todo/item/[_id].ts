import { NextApiRequest, NextApiResponse } from 'next';
import { dbConnect } from '../../../../../utils';
import { Todo, TodoList } from '../../../../../utils/models';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method } = req;
  const { _id } = req.query;

  await dbConnect();

  switch (method) {
    case 'DELETE': {
      try {
        const todoItem = await Todo.findById({ _id });
        if (!todoItem) {
          return res
            .status(404)
            .json({ message: `Todo Item id: ${_id} not found` });
        }
        let todoList = await TodoList.findById(todoItem.listId);
        if (!todoList) {
          return res.status(404).json({ message: 'List not found' });
        }
        todoList.todos = todoList.todos.filter((todo) => {
          return todo._id !== _id;
        });

        await todoItem.delete();
        await todoList.update({ $pull: { todos: _id } });

        return res.status(201).json({ message: 'Item Deleted' });
      } catch (error) {
        return res.status(500).json({ error });
      }
    }
    case 'PATCH': {
      try {
        const todoItem = await Todo.findById({ _id });
        if (!todoItem) {
          return res
            .status(404)
            .json({ message: `Todo Item id: ${_id} not found` });
        }
        await todoItem.update({ done: !todoItem.done });
        return res.status(201).json({ message: 'changed' });
      } catch (error) {
        return res.status(500).json({ error });
      }
    }
  }
};

export default handler;
