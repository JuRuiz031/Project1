import { UserResponseDTO } from './user-response.dto';

export interface LoginStatusDTO {
  authenticated: boolean;
  user?: UserResponseDTO;
  token_expires_at?: string;
}
