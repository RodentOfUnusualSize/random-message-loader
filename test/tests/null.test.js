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

	beforeAll(() => {
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
	});

	test('it does not add event listener', async () => {
		expect(windowEventListeners.size).toBe(0);
		expect(documentEventListeners.size).toBe(0);
	});

	test('it does not change DOM content', async () => {
		expect(document.head.innerHTML).toBe(headContent);
		expect(document.body.innerHTML).toBe(bodyContent);

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
