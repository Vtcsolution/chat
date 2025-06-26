const formFieldConfigByType= {
 Astrology: ["yourName", "birthDate", "birthTime", "birthPlace", "latitude","longitude"],
  Numerology: ["yourName", "birthDate"],
  Love: ["yourName", "yourBirthDate", "partnerName", "partnerBirthDate"],
  Tarot: [] 
};

const getRequiredFieldsByType= (type) =>{
    return formFieldConfigByType [type] || [];

};
module.exports = {getRequiredFieldsByType}