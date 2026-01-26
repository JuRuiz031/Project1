/**
 * Request body for POST /invite
 * Creates a shareable invite link for an event or poll.
 * Must contain EITHER event_id OR poll_id, but NOT both.
 */
export interface CreateInviteDTO {
  /** ID of the event to generate an invite link for (mutually exclusive with poll_id) */
  event_id?: string;

  /** ID of the poll to generate an invite link for (mutually exclusive with event_id) */
  poll_id?: string;

  /** When the invite link expires (ISO-8601 timestamp) */
  expiration_date: string;
}
