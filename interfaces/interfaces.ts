export interface Project {
  _id?: string;
  title: string;
  text: string;
  text2: string;
  img: string;
  repoUrl?: string;
  demoUrl?: string;
}

export interface Message {
  _id?: string;
  name: string;
  email: string;
  message: string;
}

export enum Roles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
