/**
 * Response body for POST /invite
 * Contains the generated invite link and the ID of the invited resource.
 */
export interface CreateInviteResponseDTO {
  /** ID of the event (present if invite is for an event) */
  event_id?: string;

  /** ID of the poll (present if invite is for a poll) */
  poll_id?: string;

  /** Shareable URL that grants access to the event or poll */
  invite_link: string;
}
