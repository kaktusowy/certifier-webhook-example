import { $ZodIssue } from "zod/v4/core";

export class ValidationError extends Error {
  constructor(readonly errors: $ZodIssue[]) {
    super("Validation failed");
    this.name = "ValidationError";
  }
}