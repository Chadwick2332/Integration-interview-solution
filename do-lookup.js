/**
 * The `doLookup` method should query the Shodan InternetDB for each IPv4 address passed into the `entities`
 * parameter.  You can try your method out by running the command `npm run search` in the root of this project.
 *
 * @param entities {Array} - An array of entity objects.  See `.data/input.json` for an example of what the `entities`
 * parameter looks like.
 * @returns {Promise<*[]>} - An array of results objects (See README.md for the full output specification).
 */
const axios = require('axios');

async function doLookup(entities) {
    const results = [];
  
    for (const entity of entities) {
      if (entity.isIP && entity.type === "IPv4") {
        const response = await axios.get(`https://internetdb.shodan.io/${entity.value}`)
          .catch(error => {
            console.error(error);
          });
  
        results.push({
          entity: entity,
          data: response ? response.data : null
        });
      }
    }
  
    return results;
  }

module.exports = {
    doLookup
}