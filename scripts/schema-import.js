const fs = require('fs');
const fetch = require('node-fetch');
const colors = require('colors');
require('dotenv').config();

(() => {

  if (!process.env.FAUNA_API_ENDPOINT) {
    console.log('FAUNA_API_ENDPOINT is missing in environement variables.'.bgRed.white.bold)
    return;
  };

  if (!process.env.FAUNA_DB_KEY) {
    console.log('FAUNA_DB_KEY is missing in environement variables.'.bgRed.white.bold)
    return;
  };

  const stream = fs.createReadStream('schema.graphql');
  const apiUrl = process.env.FAUNA_API_ENDPOINT + '/import';
  const authToken = `Bearer ${process.env.FAUNA_DB_KEY}`

  fetch(apiUrl, {
    method: 'POST',
    body: stream,
    headers: {
      "Authorization": authToken
    }
  }).then(res => {
    if (res.status === 401) {
      console.log(`Access denied - Please verify FAUNA_DB_KEY in environement variables\n`.red.bold, `Status code: ${res.status}`.yellow.bold)
    }
    if (res.ok) {
      console.log(`Schema has been sucessfully imported\n`.green.bold, `Status code: `.bold, `${res.status} `.yellow.bold)
    }
  });

})();