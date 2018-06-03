import { Tile } from './tile';
import { Tiletype } from './tiletype.enum';
import * as _ from 'lodash';

export class Map {
  public map: Array<Array<Tile>>;

  constructor(map: Array<Array<Tile>>) {
    this.map = map;
  }

  /**
  * Gets all the floor tiles in this map
  */
  public getFloors() {
    return _.filter(_.flatten(this.map), m => m.type === Tiletype.FLOOR);
  }
}
