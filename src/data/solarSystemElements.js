const getQuery = require('../../utils/getQuery');
const useCache = require('../../utils/cache.js');


async function getPage() {

	// todo
	// landingLogo, quan arregli lo de les imatges

	const query = `
	{
		entries(section: "elements") {
				... on elements_default_Entry {
						title,
						slug,
						elementCategory {
							title,
							slug,
						}					
				}
		}
	}`;

	const data = await getQuery(query);

	const d = data.data.entries;

	return d;
}


// export for 11ty
// module.exports = getPage;
module.exports = async () => {
  return useCache(getPage, 'solarSystemElements.json');
}