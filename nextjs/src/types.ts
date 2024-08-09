export type User = {
  email: string;
  role: string;
};

export type FormState =
  | {
      message?: string;
    }
  | undefined;
