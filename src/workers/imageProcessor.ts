// Image processing worker script
export const imageProcessorScript = `
self.onmessage = function(e) {
  const { imageData, operation, params } = e.data;
  
  try {
    let result;
    
    switch (operation) {
      case 'blur':
        result = applyBlur(imageData, params.radius || 5);
        break;
      case 'brightness':
        result = adjustBrightness(imageData, params.factor || 1.2);
        break;
      case 'contrast':
        result = adjustContrast(imageData, params.factor || 1.2);
        break;
      case 'grayscale':
        result = convertToGrayscale(imageData);
        break;
      default:
        throw new Error('Unknown operation: ' + operation);
    }
    
    self.postMessage({ success: true, result, operation });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
};

function applyBlur(imageData, radius) {
  const data = new Uint8ClampedArray(imageData.data);
  const width = imageData.width;
  const height = imageData.height;
  
  // Simple box blur implementation
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const ny = y + dy;
          const nx = x + dx;
          
          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            const idx = (ny * width + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
      }
      
      const idx = (y * width + x) * 4;
      imageData.data[idx] = r / count;
      imageData.data[idx + 1] = g / count;
      imageData.data[idx + 2] = b / count;
    }
  }
  
  return imageData;
}

function adjustBrightness(imageData, factor) {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.min(255, data[i] * factor);     // Red
    data[i + 1] = Math.min(255, data[i + 1] * factor); // Green
    data[i + 2] = Math.min(255, data[i + 2] * factor); // Blue
  }
  
  return imageData;
}

function adjustContrast(imageData, factor) {
  const data = imageData.data;
  const intercept = 128 * (1 - factor);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept));
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept));
  }
  
  return imageData;
}

function convertToGrayscale(imageData) {
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = gray;     // Red
    data[i + 1] = gray; // Green
    data[i + 2] = gray; // Blue
  }
  
  return imageData;
}
`;