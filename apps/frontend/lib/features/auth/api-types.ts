export type AuthUser = {
  id: string;
  email: string;
  name: string;
};

export type AuthApiSuccess = {
  user: AuthUser;
};

export type ApiErrorResponse = {
  error: string;
};

export type ClientResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };
