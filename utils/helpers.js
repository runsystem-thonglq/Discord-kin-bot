// Trong utils/helpers.js
function isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
  
  module.exports = { isValidUrl };