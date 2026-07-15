import { Link } from "react-router-dom";

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111111]/90 backdrop-blur-md border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <span className="text-2xl font-black text-white tracking-tighter uppercase">
            Construction Hub
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          {/* Links removed as per user request */}
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-6">
          <Link to="/login" className="hidden sm:block text-sm font-bold text-white hover:text-yellow-400 transition-colors uppercase tracking-wider">
            Log in
          </Link>
          <Link to="/login" className="bg-[#ffd000] text-black text-sm font-black px-6 py-3 hover:bg-yellow-400 transition-all uppercase tracking-wider">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
