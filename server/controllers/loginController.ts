type AppRequest = {
  body?: unknown;
};

type AppResponse = {
  status: (statusCode: number) => {
    json: (payload: unknown) => unknown;
  };
};

const { getLoginResult } = require("../services/loginService") as {
  getLoginResult: (body: unknown) => { statusCode: number; payload: unknown };
};

function loginController(request: AppRequest, response: AppResponse) {
  const result = getLoginResult(request.body);

  return response.status(result.statusCode).json(result.payload);
}

module.exports = {
  loginController,
};
