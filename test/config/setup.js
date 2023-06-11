/***********************************************************************
 *                                                                     *
 * This file is part of Saria’s random message loader program.         *
 *                                                                     *
 * Saria’s random message loader program is free software: you can     *
 * redistribute it and/or modify it under the terms of the GNU         *
 * General Public License as published by the Free Software            *
 * Foundation, either version 3 of the License, or (at your option)    *
 * any later version.                                                  *
 *                                                                     *
 * Saria’s random message loader program is distributed in the hope    *
 * that it will be useful, but WITHOUT ANY WARRANTY; without even the  *
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR     *
 * PURPOSE. See the GNU General Public License for more details.       *
 *                                                                     *
 * You should have received a copy of the GNU General Public License   *
 * along with Saria’s random message loader program.                   *
 * If not, see <https: *www.gnu.org/licenses/>.                        *
 *                                                                     *
 **********************************************************************/

// Add Jest extended matchers //////////////////////////////////////////

const jestExtended = require('jest-extended');
expect.extend(jestExtended);


// Set up fetch mocking ////////////////////////////////////////////////

require('jest-fetch-mock').enableMocks();


// Set up my own testing services //////////////////////////////////////

if (!('saria' in globalThis))
	globalThis.saria = {};

if ('testing' in saria)
	throw new Error('saria.testing already exists');

saria.testing = {};


// Partially awaiting promises ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// This is a way to await a promise that may not resolve, or may not
// resolve quickly enough.
//
// TODO: Return something to indicate if the promise is not settled
// before the wait period ends… otherwise return the promised value.
saria.testing.partiallyAwait = async (promise, ms = 1000) => {
	await Promise.any([promise, new Promise(resolve => setTimeout(resolve, ms))]);
};


// Set up JSDOM restore support ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

saria.testing.jsdom = {
	__keys :
		new Map(
			['document', 'window']
				.map(obj => [obj, new Set(Object.keys(globalThis[obj]))])
		),

	__listeners :
		new Map(
			['document', 'window']
				.map(obj => [obj, []])
		),

	restore :
		() => {
			// Remove all attributes and children of <html>, other than
			// <head> and <body>.
			for (const attribute of document.documentElement.attributes)
				document.documentElement.removeAttribute(attribute.name);

			document.documentElement.innerHTML = '<head></head><body></body>';

			// Remove all event listeners.
			for (const [obj, args] of saria.testing.jsdom.__listeners.entries()) {
				args.forEach(args => globalThis[obj].removeEventListener(...args));
				args.length = 0;
			}

			// Remove any added keys.
			for (const [obj, keys] of saria.testing.jsdom.__keys.entries()) {
				Object.keys(globalThis[obj])
					.filter(key => !keys.has(key))
					.forEach(key => { delete globalThis[obj][key]; });
			}
		},
};

const addEventListenerWrapper = obj => {
	return (...args) => {
		saria.testing.jsdom.__listeners.get(obj).push(args);
		globalThis[obj].__saria__addEventListener(...args);
	};
};

['document', 'window'].forEach(obj => {
	globalThis[obj].__saria__addEventListener = globalThis[obj].addEventListener;
	globalThis[obj].addEventListener = addEventListenerWrapper(obj);

	saria.testing.jsdom.__keys.get(obj)
		.add('addEventListener')
		.add('__saria__addEventListener')
	;
});
