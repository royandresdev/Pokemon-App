import { ErrorMessage, Field, Formik } from "formik";
import { useState } from "react";

const initialValues = {
  username: "",
  password: "",
}

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleChangeUsername = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  }

  const handleChangePassword = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  }

  const isReadyToLogin = username.trim() !== "" && password.trim() !== "";

  return (
    <main>
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors = { username: "", password: "" };

          if (!values.username) {
            errors.username = "Ingrese un usuario"
          }
          if (!values.password) {
            errors.password = "Ingrese una contraseña"
          }
          return errors;
        }}
        onSubmit={() => { }}
      >
        {
          () => (
            <form>
              <h1>Iniciar sesión</h1>
              <div>
                <label htmlFor="username">Usuario:</label>
                <Field
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={handleChangeUsername}
                />
                <ErrorMessage name="username" component="p" />
              </div>
              <div>
                <label htmlFor="password">Contraseña:</label>
                <Field
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={handleChangePassword}
                />
                <ErrorMessage name="password" component="p" />
              </div>
              <button type="submit" disabled={!isReadyToLogin}>Ingresar</button>
            </form>
          )
        }
      </Formik>
    </main>
  )
}
export default LoginPage
