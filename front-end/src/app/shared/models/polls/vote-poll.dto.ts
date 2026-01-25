/**
 * Request body for POST /polls/{poll_id}/vote
 */
export interface VotePollDTO {
  user_id: string;
  calendar_id: string;
  options: number[];
}
