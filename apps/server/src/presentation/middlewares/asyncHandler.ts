import type { Request, Response, NextFunction, RequestHandler } from "express";

export type AsyncRequestHandler<
  Req extends Request = Request,
  Res extends Response = Response,
> = (req: Req, res: Res, next: NextFunction) => Promise<unknown>;

/**
 * Higher-order function that wraps asynchronous Express route handlers
 * and middlewares to catch unhandled rejections and pass them to next().
 * Eliminates repetitive try-catch blocks across controllers and middlewares.
 */
export const asyncHandler = <
  Req extends Request = Request,
  Res extends Response = Response,
>(
  fn: AsyncRequestHandler<Req, Res>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req as Req, res as Res, next)).catch(next);
  };
};

export default asyncHandler;
