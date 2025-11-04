import { Screen } from '../../Class/Screen.js';
import map from './map.js';

import objects from './objects/index.js';

const TILE_SIZE = 75;

const WorldScreen = new Screen({
    map,
    playerStart:{ x: TILE_SIZE * 34, y: TILE_SIZE * 23.5 },
    objects: objects,
    background: "#b2b3c8"
});


export default WorldScreen;