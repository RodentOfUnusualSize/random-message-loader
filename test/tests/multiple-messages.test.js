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

// Fill a document’s body with a diverse set of elements, some of which
// want random message content (from the given URL), and some of which
// don’t.
function generateBodyTestContent(testDocument, testUrl) {
	const elements = [];

	// Some <p> elements:
	for (let i = 0; i < 3; ++i) {
		const element = testDocument.createElement('p');
		element.setAttribute('data-saria-random-message-src', testUrl);
		element.textContent = '[default content]';

		testDocument.body.appendChild(element);

		elements.push(element);
	}

	// A list:
	const list = testDocument.createElement('ol');
	for (let i = 0; i < 4; ++i) {
		const li = testDocument.createElement('li');
		li.setAttribute('data-saria-random-message-src', testUrl);
		li.textContent = `list item #${i}`;

		list.appendChild(li);

		elements.push(li);
	}
	testDocument.body.appendChild(list);

	// Deeply nested definition list (non-sibling target elements):
	const div = testDocument.createElement('div');
	const dl = testDocument.createElement('dl');
	for (let i = 0; i < 2; ++i) {
		const dt = testDocument.createElement('dt');
		dt.textContent = `Definition #${i}`;

		const dd = testDocument.createElement('dd');
		dd.setAttribute('data-saria-random-message-src', testUrl);
		dd.textContent = `[${i}]`;

		dl.appendChild(dt);
		dl.appendChild(dd);

		elements.push(dd);
	}
	div.appendChild(dl);
	testDocument.body.appendChild(div);

	return elements;
}

describe('When multiple messages are wanted from a single source', () => {
	const scriptPath = '../../src/random-message-loader.js';

	afterEach(() => {
		saria.testing.jsdom.restore();

		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('content of all target elements is changed', async () => {
		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		const elements = generateBodyTestContent(document, 'messages.txt');

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text :
					jest.fn().mockResolvedValue(
						Array.from(Array(10).keys())
							.map(n => `message #${n}`)
							.join('\n')
						),
			});

		await require(scriptPath);

		for (const element of elements) {
			expect(element.innerHTML).toMatch(/^message #[0-9]+$/);
		}
	});

	test('only one fetch request is made', async () => {
		const url = 'messages.txt';

		document.head.innerHTML = `<script src="${scriptPath}"></script>`;

		generateBodyTestContent(document, url);

		jest.spyOn(globalThis, 'fetch')
			.mockResolvedValue({
				ok   : true,
				text :
					jest.fn().mockResolvedValue(
						Array.from(Array(10).keys())
							.map(n => `message #${n}`)
							.join('\n')
						),
			});

		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(1);

		expect(fetch.mock.calls[0]).toBeArrayOfSize(1);
		expect(fetch.mock.calls[0][0]).toBe(url);
	});
});
