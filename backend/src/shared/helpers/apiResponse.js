export function sendSuccess(
  res,
  {
    message = "Request successful",
    data = null,
    statusCode = 200,
    meta = undefined,
  } = {},
) {
  const response = {
    success: true,
    message,
    data,
  };

  if (meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
}
