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
	const startTime = performance.now();
	// Initialize variables to keep track of the number of entries searched, skipped and errored
	// These aren't used for anything, but are useful for debugging purposes
	let entriesSearched = 0;
	let entriesSkipped = 0;
	let entriesErrored = 0;
  
	// Results array to store all the entries that have been searched
	const results = [];
  
	// Set to store all the entities that have been searched to avoid duplicates
	const seen = new Set();
  
	// Loop through all the entities that need to be searched
	for (const entity of entities) {
		// Check if the entity is an IP and it's of type IPv4
		if (entity.isIP && entity.type === "IPv4") {
			// Check if the entity has already been searched
			if (seen.has(entity.value)) {
				console.warn(`Skipping duplicated entry for ${entity.value}.`);
		  		// Increment entriesSkipped as we are skipping this entry
		  		entriesSkipped += 1;
		  		continue;
			}
		
			// Add the entity to the set of seen entities to avoid duplicates
			seen.add(entity.value);
			// Increment entriesSearched as we are searching this entry
			entriesSearched += 1;
			try {
				// Use the Axios library to send a GET request to the Shodan API
				const response = await axios.get(`https://internetdb.shodan.io/${entity.value}`);
				// Push the entity and its response data to the results array
				results.push({
					entity,
					data: response.data,
				});
			} catch (error) {
		  		// Increment entriesErrored as an error occurred while searching this entry
		  		entriesErrored += 1;
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
			}
	  	} else {
			console.warn(`Skipping non-IPv4 entity: ${entity.value}`);

			// Increment entriesSkipped as we are skipping this non-IPv4 entry
			entriesSkipped += 1;
	  	}
	}
  
	// Log the number of entries that have been searched, skipped and errored
	console.log(`Number of entries searched: ${entriesSearched}`);
	console.log(`Number of entries skipped: ${entriesSkipped}`);
	console.log(`Number of entries with errors: ${entriesErrored}`);
  
	// Log the total time taken to search all the entities
	console.warn(`Total time taken: ${performance.now() - startTime}ms`);

	return results;
}
  

module.exports = {
	doLookup
}