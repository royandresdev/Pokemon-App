const LoginPage = () => {
  return (
    <main>
      <form>
        <h1>Iniciar sesión</h1>
        <div>
          <label htmlFor="username">Usuario:</label>
          <input type="text" id="username" name="username" />
        </div>
        <div>
          <label htmlFor="password">Contraseña:</label>
          <input type="password" id="password" name="password" />
        </div>
        <button type="submit">Ingresar</button>
      </form>
    </main>
  )
}
export default LoginPage
