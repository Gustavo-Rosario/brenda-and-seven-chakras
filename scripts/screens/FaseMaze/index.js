import map from './map.js';
import objects from './objects/index.js';

const TILE_SIZE = 60;

const FaseMazeMap = {
    map,
    playerStart: { x: TILE_SIZE * 10, y: TILE_SIZE * 1.5 },
    objects: objects,
    background: "#1d3acc",
}


export default FaseMazeMap;