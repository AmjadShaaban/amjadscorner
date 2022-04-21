import { Project, Message } from '../interfaces';

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
