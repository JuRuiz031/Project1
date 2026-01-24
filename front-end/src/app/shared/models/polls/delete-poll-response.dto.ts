/**
 * Response body for:
 * DELETE /api/v1/polls/{poll_id}
 */
export interface DeletePollResponseDTO {
  poll_id: number;
  deleted: boolean;
}
