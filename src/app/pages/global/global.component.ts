import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss'],
})
export class GlobalComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

  public displayChallenges() {
    const overlay_message = document.getElementById('overlay_message');
    if (overlay_message) {
      overlay_message.style.display = 'block';
    }
  }
}
