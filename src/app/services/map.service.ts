import { Injectable } from '@angular/core';
import { Tile } from '../models/tile';
import { Map } from '../models/map';
import { Tiletype } from '../models/tiletype.enum';

import * as _ from 'lodash';

@Injectable()
export class MapService {
  NARROW = 
`#####################################+
# #       #       #     #         # #+
# # ##### # ### ##### ### ### ### # #+
#       #   # #     #     # # #   # #+
##### # ##### ##### ### # # # ##### #+
#   # #       #     # # # # #     # #+
# # ####### # # ##### ### # ##### # #+
# #       # # #   #     #     #   # #+
# ####### ### ### # ### ##### # ### #+
#     #   # #   # #   #     # #     #+
# ### ### # ### # ##### # # # #######+
#   #   # # #   #   #   # # #   #   #+
####### # # # ##### # ### # ### ### #+
#     # #     #   # #   # #   #     #+
# ### # ##### ### # ### ### ####### #+
# #   #     #     #   # # #       # #+
# # ##### # ### ##### # # ####### # #+
# #     # # # # #     #       # #   #+
# ##### # # # ### ##### ##### # #####+
# #   # # #     #     # #   #       #+
# # ### ### ### ##### ### # ##### # #+
# #         #     #       #       # #+
#X###################################`;

  TEST =
`###+
# #+
# #+
#X#`;

TEST2 =
`###+
# #+
# X+
###`;

TEST3 =
`###X#+
# # #+
#   #+
#####`;

  constructor() { }

  /**
  * Gets the game map object
  */
  public getMap(): any {
    return this.parse(this.NARROW);
  }

  /**
  * Parses ascii map representation into an object form
  * @param map - The ascii map we want to parse
  */
  private parse(map: any): Map {
    let up: Tile, right: Tile, down: Tile, left: Tile;
    let master = [];
    let lines: Array<string> = map.split('+');
    for (let i = 0; i < lines.length; i++) {
      let line = [];
      master.push(line);
      for (let j = 0; j < lines[i].length; j++) {
        let tile = new Tile(lines[i][j], line.length, i);

        if (tile.valid) {
          // up
          if (i === 0) {
            tile.up = null;
          }
          else {
            tile.up = master[i-1][line.length];
          }

          // left
          if (!line.length) {
            tile.left = null;
          }
          else {
            tile.left = line[line.length - 1];
          }

          // down (prev)
          if (i !== 0) {
            master[i-1][line.length].down = tile;
          }

          // right (prev)
          if (line.length) {
            line[line.length - 1].right = tile;
          }
          
          line.push(tile);
        }

      }
    }
    return new Map(master);
  }
}
