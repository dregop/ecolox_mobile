import { Component, OnInit } from '@angular/core';
import { UserFeatures } from 'src/app/models/userFeatures';
import { ToastService, toastType } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';

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
  public time_to_lvl_up = 600;//seconds : 10min
  public level = 1;
  public pourcent_lvl = 0;
  public acheived_challenges: Challenge[] = [];
  public pourcent_health = 101; // %
  public last_watering!: Date;
  public IsChallengesStarted = false;
  public features!: UserFeatures;
  public loading = true;

  constructor(public toastService: ToastService, public userService: UserService) { }
  ngOnInit() {

    // niv1 600 niv2 600*2 niv3 600*2² niv4 6002^3 time_to_lvl_up = 600*2^level; 
    // niv1: 100 - 100/6
    // health = 100 - (100/6)*level


    const intervalLvl = setInterval(() => {
      const lvl_bar = document.getElementById('lvl_bar');
      const health_bar = document.getElementById('health_bar');
      if (this.pourcent_lvl > 99) {
        this.level++;
        this.time_to_lvl_up*=1.8;
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

      this.pourcent_health = this.pourcent_health - (100 / this.time_to_lvl_up);
      if (health_bar) {
        health_bar.style.width = this.pourcent_health + '%';
        if (this.pourcent_health < 15) {
          health_bar.style.backgroundColor = '#dc2626';
        } else if (this.pourcent_health < 30) {
          health_bar.style.backgroundColor = '#fb923c';
        } else if (this.pourcent_health < 50) {
          health_bar.style.backgroundColor = '#fde047';
        } else {
          health_bar.style.backgroundColor = '#65a30d';
        }
      }
      if (this.pourcent_health < 1) {
        clearInterval(intervalLvl);
        this.IsChallengesStarted = false;
        this.toastService.handleToast(toastType.Error, 'Ta plante est décédée');
      }
    }, 1000);

    // get lvl, pourcent_lvl et pourcent_health et last_watering
    this.userService.getFeatures().subscribe({
      next: (features: UserFeatures) => {
        this.loading = false;
        this.features = features;
        if (features.level) {
          this.IsChallengesStarted = true;
          this.level = features.level;
          this.pourcent_lvl = features.pourcent_lvl;
          this.pourcent_health = features.pourcent_health;
          this.last_watering = features.last_watering;

          if (features.start_challenges) {
            const timeDelta = new Date().getTime() - new Date(features.start_challenges).getTime();
            this.time_to_lvl_up = timeDelta / 1000; // in sec to match time_to_lvl_up
            console.log(this.time_to_lvl_up);
            this.level = Math.trunc(Math.abs(Math.log2(this.time_to_lvl_up/600)));
            if (this.level === 0) {
              this.level = 1;
            } 
            this.pourcent_lvl = Math.abs(Math.log2(this.time_to_lvl_up/600)) % this.level * 100;
            console.log(this.pourcent_lvl);
            this.pourcent_health = 100 - (100/6)*this.level;
          }
        }
      },
      error: (err) => console.log(err.message)
    });


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

  public water() {
    const new_watering = new Date();
    if (this.last_watering && new_watering.getTime() - new Date(this.last_watering).getTime() < 1000) { //10s
      this.pourcent_health-= 20 / this.level;
      this.last_watering = new_watering;
      return;
    }
    this.pourcent_health+= 60;
    console.log(this.pourcent_health);
    if (this.pourcent_health > 100) {
      this.pourcent_health = 100;
      // const diff = this.health - 100;
      // console.log(this.health);
      // this.health -= diff * 1.2;
      // console.log(this.health);
    }
    this.last_watering = new_watering;
  }

  public resetChallenges() {
    this.time_to_lvl_up = 600;
    this.level = 1;
    this.pourcent_lvl = 0;
    this.pourcent_health = 101;
    this.IsChallengesStarted = false;
    // this.userService.updateFeatures({level: this.level, this.tim})
  }

  public startChallenges() {
    this.IsChallengesStarted = true;
    this.last_watering = new Date();

    if (!this.features) {
      this.userService.saveFeatures({start_challenges: new Date(),level: this.level,pourcent_lvl: this.pourcent_lvl, pourcent_health: this.pourcent_health, last_watering: new Date()}).subscribe({
        next: () => {
          console.log('features saved to db');
        },
        error: (err) => console.log(err.message)
      });
    }

  }
}
