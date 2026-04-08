import { Response, NextFunction, RequestHandler } from 'express';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function asyncHandler(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (req: any, res: Response, next: NextFunction) => Promise<void | Response>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
