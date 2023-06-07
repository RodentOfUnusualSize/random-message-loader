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

describe.skip('content of all target elements is randomly selected', () => {
	const scriptPath = '../../src/random-message-loader.js';

	const numberOfMessages = 10;
	const numberOfElements = 100;

	const expected = {
		mean : (numberOfMessages - 1) / 2,
	};

	const actual = {
		values : [],
		sum    : 0,
		mean   : undefined,
	};

	beforeEach(async () => {
		jest.resetModules();

		const url = 'messages';
		const messages = Array.from(Array(numberOfMessages).keys())
			.map(n => `message #${n}`)
		;

		fetch.mockClear();
		fetch.mockResponse(messages.join('\n'));

		document.head.innerHTML = ''
			+ '<meta charset="utf-8"/>'
			+ '<title>Title</title>'
			+ `<script src="${scriptPath}"></script>`
		;

		document.body.innerHTML = '';

		const elements = Array.from(Array(numberOfElements).keys())
			.map(n => {
				const element = document.createElement('p');
				element.setAttribute('data-saria-random-message-src', url);
				element.textContent = '[default content]';

				document.body.appendChild(element);

				return element;
			})
		;

		await require(scriptPath);

		actual.values = elements
			.map(element => element.innerHTML)
			.map(message => message.replace('message #', ''))
			.map(id => parseInt(id))
		;

		actual.sum = actual.values.reduce((x, sum) => x + sum);
		actual.mean = actual.sum / actual.values.length;
	});

	test.skip('mean is within expected range', () => {
		// For uniformly distributed indices, the mean should be the
		// halfway point.
		//
		// I don't expect the relative error to exceed ~35%, but let's
		// call it 40% to be generous.
		expect(Math.abs(actual.mean - expected.mean) / expected.mean).toBeLessThan(0.4);
	});
});
