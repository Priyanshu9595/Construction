import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function WorkerLogin() {
  const navigate = useNavigate();
  const [workerCode, setWorkerCode] = useState("W-001");
  const [pin, setPin] = useState("1234");
  const [error, setError] = useState("");
  const submit = async (event) => {
    event.preventDefault();
    const res = await fetch(`${API_BASE_URL}/api/worker/auth/verify-pin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workerCode, pin }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.message || "Login failed");
    localStorage.setItem("workerToken", data.token);
    navigate("/worker/dashboard");
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
      >
        <h1 className="text-2xl font-extrabold">Worker Login</h1>
        <p className="text-sm text-slate-500">Use Worker ID and PIN</p>
        <input
          value={workerCode}
          onChange={(e) => setWorkerCode(e.target.value)}
          className="mt-6 w-full rounded-lg border p-3"
          placeholder="Worker ID"
        />
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="mt-3 w-full rounded-lg border p-3"
          placeholder="PIN"
          type="password"
        />
        {error ? (
          <p className="mt-3 rounded bg-red-50 p-3 text-sm font-bold text-red-700">
            {error}
          </p>
        ) : null}
        <button className="mt-5 w-full rounded-lg bg-blue-600 p-3 font-extrabold text-white">
          Login
        </button>
      </form>
    </div>
  );
}
