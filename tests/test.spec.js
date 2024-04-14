describe('Test', () => {
    it('should pass', () => {
        expect(true).toBe(true);
    });
    it('should fail', () => {
        expect(false).toBe(true);
    });
    it('should be pending', () => {
        pending('this is a pending test');
    });
    xit('should be disabled', () => {
        expect(true).toBe(true);
    });
});