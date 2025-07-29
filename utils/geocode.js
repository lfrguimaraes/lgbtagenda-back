
const axios = require('axios');
const geocodeAddress = async (address) => {
  const encoded = encodeURIComponent(address);
  const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`);
  if (res.data.length === 0) throw new Error("Address not found");
  return {
    lat: parseFloat(res.data[0].lat),
    lng: parseFloat(res.data[0].lon)
  };
};
module.exports = { geocodeAddress };
