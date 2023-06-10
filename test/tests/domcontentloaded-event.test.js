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

describe('When document is becoming ready', () => {
	const scriptPath = '../../src/random-message-loader.js';

	const awaitResult = async result => {
		await Promise.any([result, new Promise(resolve => setTimeout(resolve, 1000))]);
	};

	let addEventListenerMock;
	let readyStateMock;
	let testElement;

	const listeners = [];

	beforeEach(() => {
		document.head.innerHTML = ''
			+ '<meta charset="utf-8"/>'
			+ '<title>Title</title>'
			+ `<script src="${scriptPath}"></script>`
		;

		testElement = document.createElement("p");
		testElement.setAttribute('data-saria-random-message-src', 'messages');
		testElement.textContent = 'default content';

		document.body.appendChild(testElement);

		let originalFunc = document.addEventListener;
		addEventListenerMock = jest.spyOn(document, 'addEventListener');
		addEventListenerMock.mockImplementation((...args) => {
			listeners.push(args);
			return originalFunc(...args);
		});

		readyStateMock = jest.spyOn(document, 'readyState', 'get');
		readyStateMock.mockReturnValue('loading');

		fetch.mockResponse('message content');
	});

	afterEach(() => {
		document.head.innerHTML = '';
		document.body.innerHTML = '';

		listeners.forEach(listener => document.removeEventListener(...listener));
		listeners.length = 0;

		addEventListenerMock = undefined;
		readyStateMock = undefined;
		testElement = undefined;

		fetch.mockClear();
		jest.restoreAllMocks();
		jest.resetModules();
	});

	test('listener for DOMContentLoaded event is added', async () => {
		awaitResult(require(scriptPath));

		expect(addEventListenerMock.mock.calls).toBeArrayOfSize(1);

		expect(addEventListenerMock.mock.calls[0][0]).toBe('DOMContentLoaded');
	});

	test.todo('content is changed after DOMContentLoaded event');

	test.todo('messages are fetched after DOMContentLoaded event');
});
