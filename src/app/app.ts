import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/** Root component of the application. Hosts the main router outlet. */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
