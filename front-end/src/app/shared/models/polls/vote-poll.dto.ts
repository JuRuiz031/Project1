/**
 * Request body for POST /polls/{id}/vote
 */
export interface VotePollDTO {
  user_id: string;
  calendar_id: string;

  /**
   * List of option IDs the user is voting for.
   * If the poll does not allow multiple votes, this array must contain exactly one element.
   */
  options: number[];
}
