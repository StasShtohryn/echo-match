export interface AuthCredentials {
    email: string,
    password: string
}

export interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  sub: string;
}