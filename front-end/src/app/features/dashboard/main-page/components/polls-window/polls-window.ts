import { Component, inject, signal, output, input, computed } from '@angular/core';
import { PollDTO } from '../../../../../shared/models/polls/poll.dto';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-polls-window',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './polls-window.html',
  styleUrls: ['./polls-window.css'],
})
export class PollsWindow {
  // Inputs from parent
  polls = input<PollDTO[]>([]);
  selectedPollId = input<string | null>(null); // Track which poll is currently being viewed

  // Outputs to parent
  createPoll = output<void>();
  viewPolls = output<void>();
  viewPoll = output<string>();

  onCreatePoll(): void {
    this.createPoll.emit();
  }

  onViewPolls(): void {
    this.viewPolls.emit();
  }

  onViewPoll(p: PollDTO): void {
    this.viewPoll.emit(p.poll_id);
  }

  formatPollTime(iso: string): string {
    if (!iso) return '';

    // Backend sends local datetime without timezone info
    // Parse directly without timezone conversion
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';

    const pad = (n: number) => String(n).padStart(2, '0');

    const date = `${pad(d.getMonth() + 1)}/${pad(d.getDate())}/${d.getFullYear()}`;
    let hours = d.getHours();
    const minutes = pad(d.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const time = `${hours}:${minutes} ${ampm}`;
    
    return `${date} ${time}`;
  }
}
