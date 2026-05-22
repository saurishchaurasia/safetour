import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { signup, loading } = useAuth();
  const navigate = useNavigate();

  async function submit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      await signup({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        password: form.get("password")
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card grid w-full max-w-md gap-4">
        <div>
          <p className="text-sm font-black uppercase text-safety-green">Start safely</p>
          <h1 className="text-3xl font-black">Create account</h1>
        </div>
        <label className="label">Name<input className="input" name="name" required /></label>
        <label className="label">Email<input className="input" name="email" type="email" required /></label>
        <label className="label">Phone<input className="input" name="phone" required /></label>
        <label className="label">Password<input className="input" name="password" type="password" minLength="8" required /></label>
        <button className="btn-primary" disabled={loading}>{loading ? "Creating..." : "Register"}</button>
        <p className="text-sm text-slate-500">Already registered? <Link className="text-safety-blue" to="/login">Login</Link></p>
      </form>
    </main>
  );
}
