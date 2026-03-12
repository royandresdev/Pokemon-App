type AppRequest = {
  body?: unknown;
};

type AppResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

import { getLoginResult } from "../services/loginService.js";

function loginController(request: AppRequest, response: AppResponse) {
  const result = getLoginResult(request.body);

  return response.status(result.statusCode).json(result.payload);
}

export { loginController };
