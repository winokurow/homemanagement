import {Request, Response} from "express";

type UserRole = "admin" | "planer" | "user" | string;

function checkRole(role: UserRole, opts: { hasRoles: UserRole[] }): boolean {
  return opts.hasRoles.includes(role);
}
export function isAuthorized(opts: { hasRoles: Array<UserRole>, allowSameUser?: boolean }) {
  return (req: Request, res: Response, next: Function) => {
    const {role, uid} = res.locals;
    const {id} = req.params;

    if (opts.allowSameUser && id && uid === id) {
      return next();
    }

    if (!role) {
      return res.status(403).send();
    }

    if (checkRole(role, opts)) {
      return next();
    }

    return res.status(403).send();
  };

}