import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/client";

export default function ForgotPassword() {
  async function submit(event) {
    event.preventDefault();
    const email = new FormData(event.currentTarget).get("email");
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("If the email exists, a reset link was sent");
    } catch (error) {
      toast.error(error.message);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <form onSubmit={submit} className="card grid w-full max-w-md gap-4">
        <h1 className="text-3xl font-black">Forgot password</h1>
        <label className="label">Email<input className="input" name="email" type="email" required /></label>
        <button className="btn-primary">Send reset link</button>
        <Link className="text-sm text-safety-blue" to="/login">Back to login</Link>
      </form>
    </main>
  );
}
