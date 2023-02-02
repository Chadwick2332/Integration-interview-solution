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
    let entriesSearched = 0;
    let entriesSkipped = 0;
    let entriesErrored = 0;
  
    const results = [];
    const seen = new Set();
    for (const entity of entities) {
      if (entity.isIP && entity.type === "IPv4") {
        if (seen.has(entity.value)) {
          console.warn(`Skipping duplicated entry for ${entity.value}.`);
          entriesSkipped += 1;
          continue;
        }
        seen.add(entity.value);
        entriesSearched += 1;
        try {
          const response = await axios.get(`https://internetdb.shodan.io/${entity.value}`);
          results.push({
            entity,
            data: response.data,
          });
        } catch (error) {
          entriesErrored += 1;
          if (error.response && error.response.status === 404) {
            console.warn(`No results found for ${entity.value}. Setting data to null.`);
            results.push({
              entity,
              data: null,
            });
          } else {
            console.error(`An error occurred while querying the Shodan API for ${entity.value}:`, error);
          }
        }
      } else {
        console.warn(`Skipping non-IPv4 entity: ${entity.value}`);
        entriesSkipped += 1;
      }
    }
  
    console.log(`Number of entries searched: ${entriesSearched}`);
    console.log(`Number of entries skipped: ${entriesSkipped}`);
    console.log(`Number of entries with errors: ${entriesErrored}`);
  
    return results;
  }
  

module.exports = {
    doLookup
}