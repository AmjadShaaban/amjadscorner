export interface Project {
  _id: string;
  title: string;
  text: string;
  text2: string;
  img: string;
  repoUrl?: string;
  demoUrl?: string;
}

export interface Message {
  _id: string;
  name: string;
  email: string;
  message: string;
}

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Todo {
  _id: string;
  label: string;
  listId: string;
  done: boolean;
  deleted: boolean;
}

export interface TodoList {
  _id: string;
  label: string;
  owner: string;
  todos: Todo[];
}

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
