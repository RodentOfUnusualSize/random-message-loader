describe('When the script does effectively nothing', () => {
	beforeAll(() => {
		fetch.mockClear();
	});

	test('it does not add event listener', async () => {
	});

	test('it does not change DOM content', async () => {
	});

	test('it does not fetch anything', async () => {
	});
});
