export interface PostProjectDto {
  title: string;
  text: string;
  text2: string;
  img: string;
}

export interface PostMessageDto {
  name: string;
  email: string;
  message: string;
}

export interface PostSignUpDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface PostTodoListDto {
  label: string;
}

export interface PostTodoDto {
  label: string;
  listId: string | undefined;
}
