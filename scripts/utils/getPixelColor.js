import { getCanvasContext } from './getCanvasContext.js';

export const getPixelColor = (x, y) => {
    const { canvas, context } = getCanvasContext();
    const imageData = context.getImageData(x, y, 1, 1);
    const data = imageData.data;
    const [r, g, b, a] = data;
  
    // Converter para RGBA string
    return {r, g, b, a: a / 250};
  }