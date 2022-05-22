import { FC, ReactNode } from 'react';
import { AlertOptions } from 'react-alert';
import {
  FaCheckCircle,
  FaInfoCircle,
  FaTimesCircle,
  FaTimes,
} from 'react-icons/fa';

interface AlertBoxProps {
  style: { margin: string };
  options: AlertOptions;
  message: ReactNode;
  close: () => void;
}

export const AlertBox: FC<AlertBoxProps> = ({
  style,
  options,
  message,
  close,
}) => {
  return (
    <div
      style={style}
      className={
        (options.type === 'info'
          ? ' bg-orange-500'
          : options.type === 'success'
          ? 'bg-green-500'
          : options.type === 'error'
          ? 'bg-red-500'
          : 'bg-theme') + ' text-white text-sm flex rounded '
      }
    >
      <div className='p-2 text-2xl'>
        {options.type === 'info' && <FaInfoCircle />}
        {options.type === 'success' && <FaCheckCircle />}
        {options.type === 'error' && <FaTimesCircle />}
      </div>
      <div className='p-2'>{message}</div>
      <div className='p-2 text-2xl'>
        <button onClick={close}>
          <FaTimes />
        </button>
      </div>
    </div>
  );
};
