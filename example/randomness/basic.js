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

// Container element ID for test elements.
const CONTAINER_ID = 'data';

// Source of randomly-selected messages.
const DATA_SRC = 'data.txt';

// Attribute giving number of samples.
const SAMPLES_ATTRIBUTE = 'data-samples';

// Default number of samples.
//const DEFAULT_NUMBER_OF_SAMPLES = 100;


// Get the element with the 'data' ID.
//
// If it does not exist, create it.
const dataDiv = (() => {
	let e = document.getElementById(CONTAINER_ID);

	if (e === null) {
		e = document.createElement('div');
		e.setAttribute('id', CONTAINER_ID);
		e.setAttribute('hidden', 'true');

		document.body.appendChild(e);
	}

	return e;
})();


// Get the desired number of samples.
/*const numberOfSamples = (() => {
	let n = DEFAULT_NUMBER_OF_SAMPLES;

	const attrib = dataDiv.getAttribute(SAMPLES_ATTRIBUTE);
	if (attrib !== null) 
		n = parseInt(attrib);

	return n;
})();*/

// Create the sample elements.
for (let i = 0; i < numberOfSamples; ++i) {
	const e = document.createElement('p');
	e.setAttribute('data-saria-random-message-src', DATA_SRC);

	dataDiv.appendChild(e);
}
