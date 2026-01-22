import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-polls-window',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './polls-window.html',
  styleUrl: './polls-window.css',
})
export class PollsWindow {}
