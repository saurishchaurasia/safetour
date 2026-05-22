import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await login({ email: form.get("email"), password: form.get("password") });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card grid w-full max-w-md gap-4">
        <div>
          <p className="text-sm font-black uppercase text-safety-green">Welcome back</p>
          <h1 className="text-3xl font-black">Login</h1>
        </div>
        <label className="label">Email<input className="input" name="email" type="email" required /></label>
        <label className="label">Password<input className="input" name="password" type="password" minLength="8" required /></label>
        <button className="btn-primary" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <div className="flex justify-between text-sm">
          <Link className="text-safety-blue" to="/forgot-password">Forgot password?</Link>
          <Link className="text-safety-blue" to="/register">Create account</Link>
        </div>
      </form>
    </main>
  );
}
