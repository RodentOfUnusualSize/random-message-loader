describe('Placeholder test suite to verify Jest and Jest Extended are working', () => {
	test('Jest', function () {
		expect(1 + 1).toBe(2);
	});

	test('Jest Extended', function () {
		expect(null).toBeNil();
	});
});
