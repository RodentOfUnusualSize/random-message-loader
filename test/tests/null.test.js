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

describe('When the script does effectively nothing', () => {
	const windowEventListeners = new Map();
	const documentEventListeners = new Map();

	const headContent = ''
		+ '<meta charset="utf-8">'
		+ '<title>Title</title>'
		+ '<script src="../../random-message-loader.js"></script>'
	;
	const bodyContent = ''
		+ '<h1>Heading</h1>'
		+ '<p>Paragraph.</p>'
		+ '<img src="image.png" alt="alt text">'
		+ '<p data-saria="awesome">Element with data attribute.</p>'
	;

	beforeAll(async () => {
		jest.resetModules();

		windowEventListeners.clear();
		documentEventListeners.clear();

		window.addEventListener = jest.fn((event, cb) => {
			if (!windowEventListeners.has(event))
				windowEventListeners.set(event, []);
			windowEventListeners.get(event).push(cb);
		});
		document.addEventListener = jest.fn((event, cb) => {
			if (!documentEventListeners.has(event))
				documentEventListeners.set(event, []);
			documentEventListeners.get(event).push(cb);
		});

		fetch.mockClear();

		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		await require('../../src/random-message-loader.js');
	});

	test('it does not add window event listener', async () => {
		expect(windowEventListeners.size).toBe(0);
	});

	test('it does not add document event listener', async () => {
		expect(documentEventListeners.size).toBe(0);
	});

	test('it does not change DOM content in head', async () => {
		expect(document.head.innerHTML).toBe(headContent);
	});

	test('it does not change DOM content in body', async () => {
		expect(document.body.innerHTML).toBe(bodyContent);
	});

	test('it does not change DOM content', async () => {
		expect(document.documentElement.outerHTML).toBe(
			'<html>'
			+ '<head>'
			+ headContent
			+ '</head>'
			+ '<body>'
			+ bodyContent
			+ '</body>'
			+ '</html>'
		);
	});

	test('it does not fetch anything', async () => {
		expect(fetch.mock.calls).toHaveLength(0);
	});
});
