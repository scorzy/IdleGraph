import { Component } from '@angular/core';
import { ServService } from './serv.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [ServService]
})
export class AppComponent {
  constructor(public serv: ServService) { }
}
