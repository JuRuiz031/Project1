import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';

import { PollApiService } from './api/poll-api.service';
import { CreatePollDTO } from '../models/polls/create-poll.dto';
import { UpdatePollDTO } from '../models/polls/update-poll.dto';
import { DeletePollDTO } from '../models/polls/delete-poll.dto';
import { VotePollDTO } from '../models/polls/vote-poll.dto';
import { PollDTO } from '../models/polls/poll.dto';

@Injectable({ providedIn: 'root' })
export class PollService {
  constructor(private api: PollApiService) {}

  // POST /polls: create new poll, requires admin
  create(dto: CreatePollDTO): Observable<PollDTO> {
    return this.api.createPoll(dto).pipe(
      map((r) => ({
        poll_id: r.poll_id,
        calendar_id: r.calendar_id,
        title: r.title,
        description: r.description,
        notes: r.notes,
        start_time: r.start_time,
        end_time: r.end_time,
        results_visible: r.results_visible,
        allow_multiple_votes: r.allow_multiple_votes,
        options: r.options.map((opt) => ({
          option_id: opt.option_id,
          description: opt.description,
          user_votes: opt.user_votes ?? [],
          guest_votes: opt.guest_votes ?? [],
        })),
        tags: r.tags,
      }))
    );
  }

  // PATCH /polls/{id}: update poll, requires admin
  update(pollId: string, dto: UpdatePollDTO): Observable<PollDTO> {
    return this.api.updatePoll(pollId, dto).pipe(
      map((r) => ({
        poll_id: r.poll_id,
        calendar_id: r.calendar_id,
        title: r.title,
        description: r.description,
        notes: r.notes,
        start_time: r.start_time,
        end_time: r.end_time,
        results_visible: r.results_visible,
        allow_multiple_votes: r.allow_multiple_votes,
        options: r.options.map((opt) => ({
          option_id: opt.option_id,
          description: opt.description,
          user_votes: opt.user_votes ?? [],
          guest_votes: opt.guest_votes ?? [],
        })),
        tags: r.tags,
      }))
    );
  }

  // DELETE /polls/{id}: delete poll, requires admin
  delete(pollId: string, dto: DeletePollDTO): Observable<boolean> {
    return this.api.deletePoll(pollId, dto).pipe(map((r) => r.deleted));
  }

  // POST /polls/{id}/vote: submit vote(s) on a poll
  // Requires JWT auth, user must have calendar access (admin not required)
  vote(pollId: string, dto: VotePollDTO): Observable<PollDTO> {
    return this.api.votePoll(pollId, dto).pipe(
      map((r) => ({
        poll_id: r.poll_id,
        calendar_id: r.calendar_id,
        title: r.title,
        description: r.description,
        notes: r.notes,
        start_time: r.start_time,
        end_time: r.end_time,
        results_visible: r.results_visible,
        allow_multiple_votes: r.allow_multiple_votes,
        options: r.options.map((opt) => ({
          option_id: opt.option_id,
          description: opt.description,
          user_votes: opt.user_votes ?? [],
          guest_votes: opt.guest_votes ?? [],
        })),
        tags: r.tags,
      }))
    );
  }
}
