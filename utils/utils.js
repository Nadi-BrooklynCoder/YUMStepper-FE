// utils.js
export const parseLineString = (lineString) => {
    if (
      lineString &&
      lineString.type === 'LineString' &&
      Array.isArray(lineString.coordinates)
    ) {
      return lineString.coordinates.map(coord => ({
        latitude: parseFloat(coord[1]),
        longitude: parseFloat(coord[0]),
      }));
    }
    return [];
  };
  