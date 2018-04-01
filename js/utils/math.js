/**
 * @desc Calculate if the check point are near
 * to center point in a certain radius.
 * Based on Pythagorean theorem
 * 
 * @see https://en.wikipedia.org/wiki/Pythagorean_theorem
 * 
 * @param {object} checkPoint - Lat/Lng pair as point to check
 * @param {object} centerPoint - Lat/Lng pair as center of radius.
 * @param {number} km - Kilometers from center to set radius.
 * 
 * @return {boolean} The result of math.
 */
function arePointsNear(checkPoint, centerPoint, km) {
  const ky = 40000 / 360;
  const kx = Math.cos(Math.PI * centerPoint.lat / 180.0) * ky;
  const dx = Math.abs(centerPoint.lng - checkPoint.lng) * kx;
  const dy = Math.abs(centerPoint.lat - checkPoint.lat) * ky;
  return Math.sqrt(dx * dx + dy * dy) <= km;
}