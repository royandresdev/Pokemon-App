type LoginPayload = {
  username?: string;
  password?: string;
};

type LoginResult = {
  statusCode: number;
  payload: unknown;
};

const ALLOWED_FIELDS = new Set(["username", "password"]);

function isValidLoginPayload(body: unknown): body is LoginPayload {
  return (
    typeof body === "object" &&
    body !== null &&
    !Array.isArray(body) &&
    !Object.keys(body).some((key) => !ALLOWED_FIELDS.has(key))
  );
}

function getLoginResult(body: unknown): LoginResult {
  if (!isValidLoginPayload(body)) {
    return {
      statusCode: 400,
      payload: { message: "Campos no permitidos en la solicitud" },
    };
  }

  const { username, password } = body;

  if (username === "admin" && password === "admin") {
    return {
      statusCode: 200,
      payload: { ok: true },
    };
  }

  return {
    statusCode: 401,
    payload: { message: "Credenciales inválidas" },
  };
}

module.exports = {
  getLoginResult,
};
