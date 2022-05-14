import { Project, Message, User, TodoList } from '../interfaces';

export interface ProjectResponse {
  project: Project;
}

export interface ProjectsResponse {
  projects: Project[];
}

export interface ContactResponse {
  sent?: boolean;
  error?: string;
}

export interface MessagesResponse {
  messages: Message[];
}

export interface UserResponse {
  user: User;
}

export interface TodoListsResponse {
  todoLists: TodoList[];
}
