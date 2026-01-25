/**
 * Simplified user info returned in login responses.
 * Contains only user_id and username per API spec.
 */
export interface LoginUserDTO {
  user_id: string;
  username: string;
}

/**
 * Response body for POST /login
 */
export interface LoginSuccessDTO {
  token: string;
  user: LoginUserDTO;
  expires_at: string;
}