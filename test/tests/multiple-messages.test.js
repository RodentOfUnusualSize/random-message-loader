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

describe('When multiple messages are wanted from a single source', () => {
	const scriptPath = '../../src/random-message-loader.js';

	const url = 'messages';

	const elements = [];

	beforeEach(() => {
		const messages = Array.from(Array(10).keys())
			.map(n => `message #${n}`)
		;

		fetch.mockResponse(messages.join('\n'));

		document.head.innerHTML = ''
			+ '<meta charset="utf-8"/>'
			+ '<title>Title</title>'
			+ `<script src="${scriptPath}"></script>`
		;

		// Some <p> elements:
		for (let i = 0; i < 3; ++i) {
			const element = document.createElement('p');
			element.setAttribute('data-saria-random-message-src', url);
			element.textContent = '[default content]';

			document.body.appendChild(element);

			elements.push(element);
		}

		// A list:
		const list = document.createElement('ol');
		for (let i = 0; i < 4; ++i) {
			const li = document.createElement('li');
			li.setAttribute('data-saria-random-message-src', url);
			li.textContent = `list item #${i}`;

			list.appendChild(li);

			elements.push(li);
		}
		document.body.appendChild(list);

		// Deeply nested definition list (non-sibling target elements):
		const div = document.createElement('div');
		const dl = document.createElement('dl');
		for (let i = 0; i < 2; ++i) {
			const dt = document.createElement('dt');
			dt.textContent = `Definition #${i}`;

			const dd = document.createElement('dd');
			dd.setAttribute('data-saria-random-message-src', url);
			dd.textContent = `[${i}]`;

			dl.appendChild(dt);
			dl.appendChild(dd);
		}
		div.appendChild(dl);
		document.body.appendChild(div);
	});

	afterEach(() => {
		document.head.innerHTML = '';
		document.body.innerHTML = '';

		elements.length = 0;

		fetch.mockClear();
		jest.resetModules();
	});

	test('content of all target elements is changed', async () => {
		await require(scriptPath);

		for (const element of elements) {
			expect(element.innerHTML).toMatch(/^message #[0-9]+$/);
		}
	});

	test('only one fetch request is made', async () => {
		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0]).toBeArrayOfSize(1);
		expect(fetch.mock.calls[0][0]).toBe(url);
	});
});
