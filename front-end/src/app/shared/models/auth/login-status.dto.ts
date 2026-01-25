import { LoginUserDTO } from './login-success.dto';

/**
 * Response body for GET /login (auth status check)
 */
export interface LoginStatusDTO {
  authenticated: boolean;
  user?: LoginUserDTO;
  token_expires_at?: string;
}
