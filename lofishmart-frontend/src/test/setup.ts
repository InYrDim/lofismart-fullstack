import "@testing-library/jest-dom";

// Clear localStorage between each test to prevent state leakage
// beforeEach is a global provided by vitest (globals: true in vitest.config.ts)
beforeEach(() => {
	localStorage.clear();
});
