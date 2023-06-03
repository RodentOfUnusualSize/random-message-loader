describe('When the script does effectively nothing', () => {
	windowEventListeners = new Map();
	documentEventListeners = new Map();

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
	});

	test('it does not add event listener', async () => {
		expect(windowEventListeners.size).toBe(0);
		expect(documentEventListeners.size).toBe(0);
	});

	test('it does not change DOM content', async () => {
	});

	test('it does not fetch anything', async () => {
	});
});
