import map from './map.js';
import objects from './objects/index.js';

const TILE_SIZE = 60;

const FaseSpeedJumpMap = {
    map,
    // playerStart: { x: TILE_SIZE * 245, y: TILE_SIZE * 13 },
    playerStart: { x: TILE_SIZE * 2, y: TILE_SIZE * 17 },
    objects: objects,
    background: "#1e7feeff",
}


export default FaseSpeedJumpMap;