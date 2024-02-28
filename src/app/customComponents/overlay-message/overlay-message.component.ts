import { Component, Input, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';
import { UserFeatures } from 'src/app/models/userFeatures';
import { ToastService, toastType } from 'src/app/services/toast.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'overlay-message',
  templateUrl: './overlay-message.component.html',
  styleUrls: ['./overlay-message.component.scss']
})
export class OverlayMessageComponent implements OnInit {

  public level = 'debutant';
  public tonnes = 6;
  public degres = 3.5;
  public dayTreashold = Math.trunc((this.tonnes * 1000) / 365) * 4 / 100; // treashold in kg co2 for internet TODO: do for all
  public deplacement: number = 30;
  public achats: number = 32;
  public internet: number = 6;
  public maison: number = 32;
  public deplacementMax = 30;
  public achatsMax = 32;
  public internetMax = 6;
  public maisonMax = 32;
  public displayMess1 = true;
  public displayMess2 = false;
  public displayMess3 = false;

  public userFeatures!: UserFeatures;

  private currentUser!: User;

  constructor(private userService: UserService, private toastService: ToastService) {
    this.userService.$currentUser.subscribe((user) => {
      this.currentUser = user;
    });
    this.userService.$userFeatures.subscribe((user) => {
      this.userFeatures = user;
    });
  }

  ngOnInit(): void {

  }
  
  public closeMessageOverlay(): void {
    const overlay = document.getElementById('overlay_message');
    if (overlay) {
      overlay.style.display = 'none';
    } 
  }

  public selectLevel(level: string): void {
    const debutant = document.getElementById('debutant');
    const apprenti = document.getElementById('apprenti');
    if (debutant && apprenti) {
      switch(level) {
        case 'debutant':
          if (debutant.className !== 'selected') {
            this.level = level;
            debutant.className = 'selected';
            apprenti.className = 'levelDiv';
          } else {
            this.level = '';
            debutant.className = 'levelDiv';
          }
          break;
        case 'apprenti':
          if (apprenti.className !== 'selected') {
            this.level = level;
            apprenti.className = 'selected';
            debutant.className = 'levelDiv';
          } else {
            this.level = '';
            apprenti.className = 'levelDiv';
          }
          break;
        default:
          this.level = '';
      }

    }
  }

  public next() {
      const message1 = document.getElementById('message');
      const message2 = document.getElementById('message2');
      const message3 = document.getElementById('message3');
      if (message1 && message2 && this.displayMess1) {
        message1.style.display = 'none';
        message2.style.display = 'block';
        this.displayMess2 = true;
        this.displayMess1 = false;
      } else if (message2 && message3 && this.displayMess2) {
        message2.style.display = 'none';
        message3.style.display = 'block';
        this.displayMess3 = true;
        this.displayMess2 = false;
        console.log('dis mess 3')
      }
  }

  public changeValue(category: string): void {
    console.log('JE CHANGE LA VALEUR');
    let sum = this.achats + this.deplacement + this.maison + this.internet;
    this.deplacementMax = this.deplacement + 100 - sum;
    this.achatsMax = this.achats + 100 - sum;
    this.maisonMax = this.maison + 100 - sum;
    this.internetMax = this.internet + 100 - sum;

    switch(category) {
      case 'deplacement':
        if (sum > 100) {
          this.deplacementMax = this.deplacement;
        }
        break;
      case 'achats':
        if (sum > 100) {
          this.achatsMax = this.achats;
        }
        break;
      case 'maison':
        if (sum > 100) {
          this.maisonMax = this.maison;
        }
        break;
      case 'internet':
        if (sum > 100) {
          this.internetMax = this.internet;
        }
        break;
    }
  }

  public previous(): void {
    const message1 = document.getElementById('message');
    const message2 = document.getElementById('message2');
    const message3 = document.getElementById('message3');

    if (message1 && message2 && this.displayMess2) {
      message1.style.display = 'block';
      message2.style.display = 'none';
      this.displayMess1 = true;
      this.displayMess2 = false;
    } else if (message2 && message3 && this.displayMess3) {
      message2.style.display = 'block';
      message3.style.display = 'none';
      this.displayMess2 = true;
      this.displayMess3 = false;
    }
  }

  public validate(): void {
    let sum = this.achats + this.deplacement + this.maison + this.internet;
    if (sum < 100) {
      this.toastService.handleToast(toastType.Info, 'La somme doit être égale à 100.');
      return;
    }
    this.closeMessageOverlay();

    this.userFeatures = new UserFeatures(this.level, this.deplacement, this.achats, this.maison, this.internet);
    this.userService.$userFeatures.next(this.userFeatures);

    if (this.userFeatures && this.userFeatures.level) {
      this.userService.updateFeatures(this.userFeatures).subscribe({
        next: () => {
          console.log('features updated to db');
        },
        error: (err) => console.log(err.message)
      });
    } else {
      this.userService.saveFeatures(this.userFeatures).subscribe({
        next: () => {
          console.log('features saved to db');
        },
        error: (err) => console.log(err.message)
      });
    }

  }

  public isSelected(): boolean {
    const debutant = document.getElementById('debutant');
    const apprenti = document.getElementById('apprenti');

    if ((debutant && debutant.className === 'selected') || (apprenti && apprenti.className === 'selected')) {
      return true;
    } else {
      return false;
    }
  } 

}
