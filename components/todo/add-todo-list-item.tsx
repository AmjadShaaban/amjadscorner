import { FC, useState } from 'react';
import { usePostTodo } from '../../utils/hooks';
import { ButtonSpinner } from '../button-spinner';

interface AddTodoListItemProps {
  listId: string;
}

export const AddTodoListItem: FC<AddTodoListItemProps> = ({ listId }) => {
  const [label, setLabel] = useState('');
  const { mutateAsync: doPost, isLoading: isPosting } = usePostTodo();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        doPost({
          label,
          listId,
        }).finally(() => {
          setLabel('');
        });
      }}
    >
      <input
        type='text'
        className=' border-2 border-gray-400 rounded-md p-1 shadow-lg mt-5'
        placeholder='Name'
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />

      <button
        disabled={isPosting}
        type='submit'
        className={
          (isPosting ? 'bg-gray-400' : 'bg-red-600') +
          ' rounded text-white px-5 py-1 mt-4'
        }
      >
        {isPosting ? (
          <>
            <ButtonSpinner />
            Loading...
          </>
        ) : (
          <>Add Todo Item</>
        )}
      </button>
    </form>
  );
};
