import {Tiletype} from './tiletype.enum';
import {Dir} from './dir.enum';
import * as _ from 'lodash';

export class Tile {
  public type: Tiletype;
  public display: string;
  public valid: boolean;
  public up: Tile;
  public right: Tile;
  public down: Tile;
  public left: Tile;
  public x: number;
  public y: number;
  public id: number;

  public player: boolean;
  public troll: boolean;

  constructor(
    s: string, x: number, y: number
  ) {
    this.valid = true;
    this.player = false;
    this.troll = false;
    this.seTypeFromStr(s);
    this.up = null;
    this.right = null;
    this.down = null;
    this.left = null;
    this.x = x;
    this.y = y;
    this.id = x + (y * 1000);
  }

  /**
  * Sets tile type
  * @param type - type to set
  */
  public setType(type: Tiletype) {
    this.type = type;
  }

  /**
  * Sets tile type from ascii string representation
  * @param s - ascii string representation ['#', ' ', 'X']
  */
  public seTypeFromStr(s: string) {
    switch (s) {
      case '#':
      this.type = Tiletype.WALL;
      this.display = 'wall';
      break;
      case ' ':
      this.type = Tiletype.FLOOR;
      this.display = 'floor';
      break;
      case 'X':
      this.type = Tiletype.EXIT;
      this.display = 'exit';
      break;
      default:
      console.error(`Could not infer tile type from '${s}'`);
      this.display = 'invalid';
      this.valid = false;
      break;
    }
  }

  /**
  * Moves player in a direction
  * @param dir - direction to move in
  */
  public moveTo(dir: string): Tile {
    if (this[dir]) {
      if (this[dir].type !== Tiletype.WALL) {
        this.player = false;
        this[dir].player = true;
        return this[dir];
      }
      else {
        // see if we can push the wall
        if (this[dir][dir] && this[dir][dir].type !== Tiletype.WALL) {
          this.player = false;
          this[dir].makeFloor();
          this[dir].player = true;
          if (this[dir][dir].type !== Tiletype.EXIT) {
            this[dir][dir].makeWall();
            if (this[dir][dir].troll) {
              // crush the troll
              this[dir][dir].troll = false;
            }
          }
          return this[dir];
        }
      }
    }
    return this;
  }
  
  /**
  * Moves a troll in a random direction
  */
  public moveTroll(): Tile {
    if (!this.troll)
      return this;

    let foundDir = false;
    let randomInt = _.random(3);
    // look through each direction until we find one we can move to
    for (let i = 0; i < 4 && !foundDir; i++) {
      let randomDir = Dir[randomInt];
      let randomTile = this[randomDir.toLowerCase()];
      if (randomTile && randomTile.type === Tiletype.FLOOR && !randomTile.troll) {
        randomTile.troll = true;
        this.troll = false;
        return randomTile;
      }
      randomInt = (randomInt + 1) % 4;
    }

    // we can't move anywhere, so don't move
    return this;
  }

  /**
  * Makes this tile a floor
  */
  public makeFloor() {
    this.seTypeFromStr(' ');
  }

  /**
  * Moves this tile a wall
  */
  public makeWall() {
    this.seTypeFromStr('#');
  }

  /**
  * Moves the player up
  */
  public moveUp(): Tile {
    return this.moveTo('up');
  }

  /**
  * Moves the player right
  */
  public moveRight(): Tile {
    return this.moveTo('right');
  }

  /**
  * Moves the player down
  */
  public moveDown(): Tile {
    return this.moveTo('down');
  }

  /**
  * Moves the player left
  */
  public moveLeft(): Tile {
    return this.moveTo('left');
  }
}
