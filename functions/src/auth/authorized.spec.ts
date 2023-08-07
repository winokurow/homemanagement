import { Request, Response } from "express";
import {isAuthorized} from "./authorized";

// Mocking the Express objects
const mockRequest = (uid: string, params: any): Request => ({
  params,
}) as Request;

const mockResponse = () => {
  const res: Response = {} as Response;
  res.locals = {
    role: 'admin', // Replace with any desired role for testing.
    uid: 'user123', // Replace with any desired UID for testing.
  };
  res.status = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("isAuthorized", () => {
  it("should allow access if the user has the required role", () => {
    const req = mockRequest('user123', {});
    const res = mockResponse();
    const next = jest.fn();

    const opts = { hasRoles: ['admin', 'user'] };
    const middleware = isAuthorized(opts);

    middleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should allow access for the same user when 'allowSameUser' option is enabled", () => {
    const req = mockRequest('user123', { id: 'user123' });
    const res = mockResponse();
    const next = jest.fn();

    const opts = { hasRoles: ['user'], allowSameUser: true };
    const middleware = isAuthorized(opts);

    middleware(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should return 403 status if the user does not have the required role", () => {
    const req = mockRequest('user123', {});
    const res = mockResponse();
    const next = jest.fn();

    const opts = { hasRoles: ['planer'] };
    const middleware = isAuthorized(opts);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("should return 403 status if no role is present in locals", () => {
    const req = mockRequest('user123', {});
    const res = mockResponse();
    res.locals.role = undefined;
    const next = jest.fn();

    const opts = { hasRoles: ['user'] };
    const middleware = isAuthorized(opts);

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.send).toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });
});
