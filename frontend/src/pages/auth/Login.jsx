import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
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

      const user = data;
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
    <div className="min-h-screen flex font-sans bg-[#111111] selection:bg-[#ffd000] selection:text-black relative">
      {/* Back to Home Button - Absolute positioned at the top right of the whole screen */}
      <Link
        to="/"
        className="absolute top-6 right-6 lg:top-8 lg:right-12 z-50 flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-white uppercase tracking-wider transition-colors"
      >
        <ArrowLeft size={16} /> Back to Home
      </Link>

      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] relative flex-col justify-between p-12 overflow-hidden border-r border-zinc-900">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1541888081600-47c4bc47ce39?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center grayscale mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent z-0" />

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/"
            className="text-2xl font-black text-white tracking-tighter uppercase hover:text-[#ffd000] transition-colors"
          >
            Construction Hub
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-black text-white leading-none mb-6 uppercase tracking-tighter">
            Role-based
            <br />
            access.
          </h2>
          <p className="text-zinc-400 text-lg font-medium leading-relaxed">
            Super admins, company owners, project teams, site staff and clients
            all land on the right dashboard.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16">
        <div className="w-full max-w-lg animate-in fade-in slide-in-from-bottom-8 duration-700 mt-12 lg:mt-0">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <Link
              to="/"
              className="text-xl font-black text-white tracking-tighter uppercase"
            >
              Construction Hub
            </Link>
          </div>

          <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">
            Log in
          </h1>
          <p className="text-zinc-500 mb-8 font-medium">
            Enter your credentials to access your role dashboard.
          </p>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full px-4 py-3 rounded-none border-b-2 border-zinc-800 bg-[#1a1a1a] text-white focus:border-[#ffd000] focus:ring-0 outline-none transition-colors placeholder:text-zinc-600 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-12 rounded-none border-b-2 border-zinc-800 bg-[#1a1a1a] text-white focus:border-[#ffd000] focus:ring-0 outline-none transition-colors placeholder:text-zinc-600 font-medium"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error ? (
              <div className="border border-red-900/50 bg-red-900/20 px-4 py-3 text-sm font-semibold text-red-400">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#ffd000] text-black font-black uppercase tracking-wider rounded-none px-4 py-4 hover:bg-yellow-400 transition-colors mt-4 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              Sign In
              {!isLoading ? <ArrowRight size={18} /> : null}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
