import map from './map.js';
import objects from './objects/index.js';

const TILE_SIZE = 60;

const Fase04Map = {
    map,
    playerStart: { x: TILE_SIZE * 10, y: TILE_SIZE * 1.5 },
    objects: objects,
    background: "#16161d"
}


export default Fase04Map;