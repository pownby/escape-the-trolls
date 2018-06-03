import { Injectable } from '@angular/core';
import { Tile } from '../models/tile';
import { Tiletype } from '../models/tiletype.enum';
import { Map } from '../models/map';
import { MapService } from './map.service';
import { Dir } from '../models/dir.enum';

import { Subject }    from 'rxjs/Subject';
import * as _ from 'lodash';

@Injectable()
export class GameService {
  map: Map;
  floors: Array<Tile>;
  playerTile: Tile;
  trollTiles: Array<Tile>;
  path: Array<Dir>;
  autoFinishRef: any;
  trollRef: any;
  pathChecked: Array<number>;

  private gameCompletedSource = new Subject<string>();
  gameCompleted = this.gameCompletedSource.asObservable();

  constructor(
    private mapService: MapService
  ) { }

  public init() {
    if (this.autoFinishRef)
      clearTimeout(this.autoFinishRef);

    if (this.trollRef)
      clearTimeout(this.trollRef);
      
    this.map = this.mapService.getMap();
    this.floors = _.shuffle(this.map.getFloors());

    if (this.floors.length) {
      this.playerTile = this.floors[0];
      this.playerTile.player = true;

      if (this.floors.length > 4) {
        this.trollTiles = [
          this.floors[1],
          this.floors[2],
          this.floors[3]
        ];
        this.trollTiles.forEach(tile => { tile.troll = true; });
      }
    }

    this.trollRef = setTimeout(() => { this.moveTrolls(); }, 2000);
    return this.map.map;
  }

  /**
  * Moves all the trolls
  */
  private moveTrolls() {
    this.trollTiles.forEach((tile, i) => { this.trollTiles[i] = tile.moveTroll(); });
    if (!this.checkEat()) {
      this.trollRef = setTimeout(() => { this.moveTrolls(); }, 1000);
    }
  }

  /**
  * Moves the player in a direction
  * @param dir - direction to move the player
  */
  private movePlayer(dir: string) {
    if (this.playerTile) {
      this.playerTile = this.playerTile[`move${dir}`]();
      this.checkEat();
      this.checkExit();
    }
  }

  /**
  * Moves the player up
  */
  public movePlayerUp() {
    this.movePlayer('Up');
  }

  /**
  * Moves the player right
  */
  public movePlayerRight() {
    this.movePlayer('Right');
  }

  /**
  * Moves the player down
  */
  public movePlayerDown() {
    this.movePlayer('Down');
  }

  /**
  * Moves the player left
  */
  public movePlayerLeft() {
    this.movePlayer('Left');
  }

  /**
  * Checks if the player has reached the exit
  */
  private checkExit(): boolean {
    if (this.playerTile.type === Tiletype.EXIT) {
      clearTimeout(this.trollRef);
      if (!_.some(this.trollTiles, (tile => tile.troll))) {
        // all trolls were crushed -- secret ending
        console.log("You are the champion!");
        this.gameCompletedSource.next('champion');
      }
      else {
        console.log("ESCAPED!");
        this.gameCompletedSource.next('escaped');
      }
      return true;
    }
    return false;
  }

  /**
  * Check if the player has been eaten by a troll
  */
  private checkEat(): boolean {
    if (this.playerTile.troll) {
      console.log("Eaten! :(");
      clearTimeout(this.trollRef);
      this.gameCompletedSource.next('eaten');
      return true;
    }
    return false;
  }

  /**
  * Engages auto-finish mode, where we will solve the maze for the user
  */
  public autoFinish() {
    this.pathChecked = [];
    this.path = this.findPath([], this.playerTile);
    this.autoMove();
  }

  /**
  * Performs a single move of auto-finish mode and sets up the next move
  */
  private autoMove() {
    if (this.checkExit()) {
      return;
    }
    else if (!this.path || !this.path.length) {
      console.log("Could not find a path to get to the exit!");
      this.gameCompletedSource.next('stuck');
    }
    else {
      let nextDir = this.path.shift();
      switch (nextDir) {
        case Dir.Up:
        this.playerTile = this.playerTile.moveUp();
        break;
        case Dir.Right:
        this.playerTile = this.playerTile.moveRight();
        break;
        case Dir.Down:
        this.playerTile = this.playerTile.moveDown();
        break;
        case Dir.Left:
        this.playerTile = this.playerTile.moveLeft();
        break;
      }
      this.autoFinishRef = setTimeout(() => { this.autoMove(); }, 70);
    }
  }

  /**
  * Checks a direction to find a path to the maze exit
  * @param dir - Direction we are checking
  * @param tile - The tile we are checking from
  * @param path - Path so far discovered
  * @returns null if this tile or none of its progeny can find the exit, or the final path if we found the exit
  */
  private checkDir(dir: Dir, tile: Tile, path: Array<Dir>): Array<Dir> {
    if (tile) {
      if (tile.type === Tiletype.EXIT) {
        // we found the exit -- simply return this path
        path.push(dir);
        return path;
      }
      else if (tile.type === Tiletype.FLOOR) {
        let clone = _.clone(path);
        clone.push(dir);
        return this.findPath(clone, tile);
      }
    }

    return null;
  }

  /**
  * Recursively finds the path to the maze exit
  * @param path - Path so far discovered
  * @param tile - The tile we are checking
  * @returns null if this tile or none of its progeny can find the exit, or the final path if we found the exit
  */
  private findPath(path: Array<Dir>, tile: Tile): Array<Dir> {
    if (this.pathChecked.indexOf(tile.id) > -1) {
      // we've already checked the path from this tile -- this is a redundant check
      return null;
    }
    else {
      // mark this tile as checked
      this.pathChecked.push(tile.id);
    }

    let fromDir: Dir = null;
    let checkDir: Array<Dir> = null;
    if (path.length) {
      fromDir = path[path.length  - 1];
    }

    if (fromDir !== Dir.Up) {
      checkDir = this.checkDir(Dir.Down, tile.down, path);
    }

    if (!checkDir && fromDir !== Dir.Right) {
      checkDir = this.checkDir(Dir.Left, tile.left, path);
    }

    if (!checkDir && fromDir !== Dir.Down) {
      checkDir = this.checkDir(Dir.Up, tile.up, path);
    }

    if (!checkDir && fromDir !== Dir.Left) {
      checkDir = this.checkDir(Dir.Right, tile.right, path);
    }

    return checkDir;
  }
}
