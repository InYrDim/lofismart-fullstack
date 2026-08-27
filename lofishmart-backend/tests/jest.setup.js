/**
 * Jest setup — mocks ESM-only modules that Jest can't parse.
 */
jest.mock("@scalar/express-api-reference", () => ({
  apiReference: jest.fn(() => (req, res, next) => next()),
}));
