import { AppError } from "../shared/errors/AppError.js";

export function validate(schema) {
  return async function (req, res, next) {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (validatedData.body !== undefined) {
        req.body = validatedData.body;
      }

      if (validatedData.query !== undefined) {
        req.validatedQuery = validatedData.query;
      }

      if (validatedData.params !== undefined) {
        req.validatedParams = validatedData.params;
      }

      next();
    } catch (error) {
      if (error.name === "ZodError") {
        return next(
          new AppError("Request validation failed", 400, {
            errors: error.issues.map((issue) => ({
              field: issue.path.join("."),
              message: issue.message,
            })),
          }),
        );
      }

      next(error);
    }
  };
}
