import { Request, Response } from "express";
import * as admin from "firebase-admin";
import {isAuthenticated} from "./authenticated";

// Mock the verifyIdToken function
jest.mock("firebase-admin", () => ({
  auth: jest.fn(() => ({
    verifyIdToken: jest.fn(() => ({ uid: "user-id", role: "user-role", email: "user@example.com" })),
  })),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("isAuthenticated middleware", () => {
  let req: Request;
  let res: Response;
  let next: jest.Mock<Function>;

  beforeEach(() => {
    req = {
      headers: {},
    } as Request;

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      locals: {},
    } as unknown as Response;

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 401 if authorization header is missing", async () => {
    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if authorization header does not start with 'Bearer'", async () => {
    req.headers.authorization = "invalid-token";

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 401 if the token is not in the correct format", async () => {
    req.headers.authorization = "Bearer";

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should set res.locals and call next if the token is valid", async () => {
    const validToken = "valid-token";
    req.headers.authorization = `Bearer ${validToken}`;

    await isAuthenticated(req, res, next);

    expect(res.locals.uid).toBe("user-id");
    expect(res.locals.role).toBe("user-role");
    expect(res.locals.email).toBe("user@example.com");
    expect(next).toHaveBeenCalled();
  });

  it("should return 401 if the token verification fails", async () => {
    const invalidToken = "invalid-token";
    const errorMessage = "Invalid token";

    (admin.auth as jest.Mocked<any>).mockRejectedValueOnce({
      verifyIdToken: (new Error(errorMessage)),
    });

    req.headers.authorization = `Bearer ${invalidToken}`;

    await isAuthenticated(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith({ message: "Unauthorized" });
    expect(next).not.toHaveBeenCalled();
  });
});
