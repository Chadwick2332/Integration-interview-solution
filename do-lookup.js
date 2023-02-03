/**
 * The `doLookup` method should query the Shodan InternetDB for each IPv4 address passed into the `entities`
 * parameter.  You can try your method out by running the command `npm run search` in the root of this project.
 *
 * @param entities {Array} - An array of entity objects.  See `.data/input.json` for an example of what the `entities`
 * parameter looks like.
 * @returns {Promise<*[]>} - An array of results objects (See README.md for the full output specification).
 */
const axios = require('axios');

function doLookup(entities) {
	// Results array to store all the entries that have been searched
	const results = [];
  
	// Set to store all the entities that have been searched to avoid duplicates
	const seen = new Set();
  
	// Counter to keep track of how many entities have been searched
	let count = 0;
  
	// Loop through all the entities that need to be searched
	for (const entity of entities) {
		// Check if the entity is an IP and it's of type IPv4
		if (entity.isIP && entity.type === "IPv4") {
			// Check if the entity has already been searched
			if (seen.has(entity.value)) {
				console.warn(`Skipping duplicated entry for ${entity.value}.`);
		  		continue;
			}
		
			// Add the entity to the set of seen entities to avoid duplicates
			seen.add(entity.value);

			// Use the Axios library to send a GET request to the Shodan API
			axios.get(`https://internetdb.shodan.io/${entity.value}`)
		  		.then(response => {
					// Push the entity and its response data to the results array
					results.push({
			  			entity,
			  			data: response.data,
					});
		  		})
		  		.catch(error => {
					// Check if the error is a 404 error (no results found)
					if (error.response && error.response.status === 404) {
			  			console.warn(`No results found for ${entity.value}. Setting data to null.`);
			  			// Push the entity and its response data (null) to the results array
			  			results.push({
							entity,
							data: null,
			  			});
					} else {
			  			console.error(`An error occurred while querying the Shodan API for ${entity.value}:`, error);
					}
				});
		} else {
			// Push the entity and its response data (null) to the results array
			results.push({
				entity,
				data: null,
			});
		}
	}
	return results;
}
  

module.exports = {
	doLookup
}