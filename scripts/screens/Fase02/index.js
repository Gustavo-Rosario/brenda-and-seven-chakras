import map from './map.js';
import objects from './objects/index.js';

const TILE_SIZE = 60;

const Fase02Map = {
    map,
    playerStart: { x: TILE_SIZE * 21, y: TILE_SIZE * 13 },
    objects: objects,
    background: "#477fefff"
}


export default Fase02Map;