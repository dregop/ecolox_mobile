import { Component, OnInit } from '@angular/core';

export interface Challenge {
  id: number,
  category: string,
  sumary: string,
  status: string
}

@Component({
  selector: 'app-global',
  templateUrl: './global.component.html',
  styleUrls: ['./global.component.scss'],
})
export class GlobalComponent  implements OnInit {
  public time_to_lvl_up = 60;//seconds
  public lvl = 1;
  public pourcent_lvl = 0;
  public acheived_challenges: Challenge[] = [];

  constructor() { }
  ngOnInit() {
    const lvl_bar = document.getElementById('lvl_bar');
    setInterval(() => {
      if (this.pourcent_lvl > 99) {
        this.lvl++;
        this.time_to_lvl_up*=2;
        this.pourcent_lvl = 0;
        console.log(this.pourcent_lvl);
      }
      this.pourcent_lvl = this.pourcent_lvl + (100 / this.time_to_lvl_up);
      console.log(this.pourcent_lvl);
      if (lvl_bar) {
        if(this.pourcent_lvl < 6) { 
          lvl_bar.style.width = '6%'; // let some space for writing
        } else {
          lvl_bar.style.width = this.pourcent_lvl + '%';
        }
      }
    }, 1000);
  }

  public trunc(numb:number): number {
    return Math.trunc(numb);
  }

  public displayChallenges() {
    const overlay_message = document.getElementById('overlay_message');
    if (overlay_message) {
      overlay_message.style.display = 'block';
    }
  }
}
