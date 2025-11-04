import { baseInfo } from './baseInfo.js';

export const getCanvasContext = () => {
    const canvas = document.getElementById(baseInfo.CANVAS_ID);
    if (!canvas) {
        throw new Error(`Canvas with id '${baseInfo.CANVAS_ID}' not found.`);
    }
    
    const context = canvas.getContext('2d', {willReadFrequently: true});
    if (!context) {
        throw new Error(`Could not get 2D context for canvas with id '${baseInfo.CANVAS_ID}'.`);
    }
    
    return { canvas, context };
}