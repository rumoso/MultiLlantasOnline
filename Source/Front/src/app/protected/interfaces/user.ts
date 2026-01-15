export interface User {
  idUser: number;
  name: string;
}

export function initUser(): User {
  return {
    idUser: 0,
    name: ''
  };
}
