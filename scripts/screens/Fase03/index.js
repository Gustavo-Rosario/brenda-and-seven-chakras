import map from './map.js';
import objects from './objects/index.js';

const TILE_SIZE = 60;

const Fase03Map = {
    map,
    playerStart: { x: TILE_SIZE * 50, y: TILE_SIZE * 3},
    objects: objects,
    background: "#16161d"
}


export default Fase03Map;