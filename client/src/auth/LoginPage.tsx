import { ErrorMessage, Field, Formik } from "formik";

const initialValues = {
  username: "",
  password: "",
}

const LoginPage = () => {
  return (
    <main>
      <Formik
        initialValues={initialValues}
        validate={values => {
          const errors: { username?: string; password?: string } = {};

          if (!values.username) {
            errors.username = "Ingrese un usuario";
          }
          if (!values.password) {
            errors.password = "Ingrese una contraseña";
          }
          return errors;
        }}
        onSubmit={(values, { setStatus, setSubmitting }) => {
          if (values.username !== "admin" || values.password !== "admin") {
            setStatus("Credenciales inválidas");
            setSubmitting(false);
          }
        }}
      >
        {({ status, values, handleSubmit, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <h1>Iniciar sesión</h1>
            <div>
              <label htmlFor="username">Usuario:</label>
              <Field type="text" id="username" name="username" disabled={isSubmitting} />
              <ErrorMessage name="username" component="p" />
            </div>
            <div>
              <label htmlFor="password">Contraseña:</label>
              <Field type="password" id="password" name="password" disabled={isSubmitting} />
              <ErrorMessage name="password" component="p" />
            </div>
            {status && <p>{status}</p>}
            <button
              type="submit"
              disabled={!values.username.trim() || !values.password.trim() || isSubmitting}
            >
              {isSubmitting ? "Cargando..." : "Ingresar"}
            </button>
          </form>
        )}
      </Formik>
    </main>
  );
}
export default LoginPage
