import React from 'react';

// Helper to create type-safe contexts along with their hooks w/o an initial default value

export const createContext = <A extends unknown | null>() => {
  const Context = React.createContext<A | undefined>(undefined);

  const useContext = () => {
    const context = React.useContext(Context);

    if (context === undefined) {
      throw new Error('useContext must be inside a Provider with a value');
    }

    return context;
  };

  return [useContext, Context] as const;
};
