export type AppErrorCode =
  | "MISCONFIGURATION"
  | "VALIDATION"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL";

export class AppError extends Error {
  public readonly code: AppErrorCode;
  public readonly status: number;
  public readonly cause?: unknown;
  public readonly meta?: Record<string, unknown>;

  constructor(opts: {
    code: AppErrorCode;
    message: string;
    status: number;
    cause?: unknown;
    meta?: Record<string, unknown>;
  }) {
    super(opts.message);
    this.name = "AppError";
    this.code = opts.code;
    this.status = opts.status;
    this.cause = opts.cause;
    this.meta = opts.meta;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}
