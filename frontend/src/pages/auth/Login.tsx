import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Building2, Eye, EyeOff, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";



type LoginResponse = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  companyId?: string;
  redirectPath?: string;
  token: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      const user = data as LoginResponse;
      localStorage.setItem("token", user.token);
      localStorage.setItem("user", JSON.stringify(user));
      navigate(user.redirectPath || "/app");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex font-sans bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-blue-900 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1541888081600-47c4bc47ce39?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-blue-900/80 to-transparent z-0" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <Building2 className="text-white" size={24} />
          </div>
          <span className="text-2xl font-bold text-white">BuildFlow</span>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Role-based access for every construction workflow.
          </h2>
          <p className="text-slate-400 text-lg">
            Super admins, company owners, project teams, site staff and clients all land on the right dashboard.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-slate-900">BuildFlow</span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">Log in</h1>
          <p className="text-slate-500 mb-8">Enter your credentials to access your role dashboard.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all bg-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold rounded-lg px-4 py-3.5 hover:bg-blue-700 transition-colors mt-2 shadow-lg shadow-blue-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              Sign In
              {!isLoading ? <ArrowRight size={18} /> : null}
            </button>
          </form>




        </div>
      </div>
    </div>
  );
}
