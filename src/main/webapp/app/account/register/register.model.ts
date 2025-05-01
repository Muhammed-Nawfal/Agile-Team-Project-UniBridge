export interface IRegister {
  login: string;
  email: string;
  password: string;
  langKey?: string;
  firstName: string; // ← new
  lastName: string; // ← new
}
