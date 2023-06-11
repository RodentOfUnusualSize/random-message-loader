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
	const scriptPath = '../../src/random-message-loader.js';

	const expectedContent = {
		document : '',
		head     : '',
		body     : '',
	};

	const headContent = ''
		+ '<meta charset="utf-8"/>'
		+ '<title>Title</title>'
		+ `<script src="${scriptPath}"></script>`
	;

	const bodyContent = ''
		+ '<h1>Heading</h1>'
		+ '<p>Paragraph.</p>'
		+ '<img src="image.png" alt="alt text"/>'
		+ '<p data-saria="awesome">Element with data attribute.</p>'
	;

	beforeAll(() => {
		// Determine expected content by setting document content, then
		// examining it.
		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		expectedContent.document = document.documentElement.outerHTML;

		expectedContent.head = document.head.innerHTML;
		expectedContent.body = document.body.innerHTML;

		// Restore to defaults.
		saria.testing.jsdom.restore();
	});

	afterEach(() => {
		saria.testing.jsdom.restore();

		fetch.mockClear();
		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('it does not add window event listener', async () => {
		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		jest.spyOn(window, 'addEventListener');

		await require(scriptPath);

		expect(window.addEventListener.mock.calls).toBeArrayOfSize(0);
	});

	test('it does not add document event listener', async () => {
		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		jest.spyOn(document, 'addEventListener');

		await require(scriptPath);

		expect(document.addEventListener.mock.calls).toBeArrayOfSize(0);
	});

	test('it does not change DOM content in head', async () => {
		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		await require(scriptPath);

		expect(document.head.innerHTML).toBe(expectedContent.head);
	});

	test('it does not change DOM content in body', async () => {
		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		await require(scriptPath);

		expect(document.body.innerHTML).toBe(expectedContent.body);
	});

	test('it does not change DOM content', async () => {
		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		await require(scriptPath);

		expect(document.documentElement.outerHTML).toBe(expectedContent.document);
	});

	test('it does not fetch anything', async () => {
		document.head.innerHTML = headContent;
		document.body.innerHTML = bodyContent;

		await require(scriptPath);

		expect(fetch.mock.calls).toBeArrayOfSize(0);
	});
});
