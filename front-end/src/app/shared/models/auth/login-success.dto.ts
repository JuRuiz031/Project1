import { UserResponseDTO } from "./user-response.dto";

export interface LoginSuccessDTO {
    token: string;
    user: UserResponseDTO;
    expires_at: string;
}