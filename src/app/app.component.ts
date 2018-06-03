import { Component, HostListener } from '@angular/core';
import { GameService } from './services/game.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  map: any;
  public state: string;

  constructor(private game: GameService) {
    this.state = 'start';
    this.map = game.init();
    game.gameCompleted.subscribe(state => { this.state = state; });
  }

  /**
  * Handle direction key input
  */
  @HostListener('document:keydown', ['$event']) onClick(e) {
    if (this.state === 'start') {
      if (e.key === 'ArrowUp' || e.key === 'w') {
        this.game.movePlayerUp();
      }
      else if (e.key === 'ArrowRight' || e.key === 'd') {
        this.game.movePlayerRight();
      }
      else if (e.key === 'ArrowDown' || e.key === 's') {
        this.game.movePlayerDown();
      }
      else if (e.key === 'ArrowLeft' || e.key === 'a') {
        this.game.movePlayerLeft();
      }
    }
  }

  /**
  * Engages auto-finish mode
  */
  public autoFinish() {
    this.state = 'autoFinish';
    this.game.autoFinish();
  }

  /**
  * Restarts the game
  */
  public restart() {
    this.state = 'start';
    this.map = this.game.init();
  }
}
