import { Link } from "react-router-dom";
import { Building2 } from "lucide-react";

export default function PublicNavbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Building2 className="text-white" size={24} />
          </div>
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
            BuildFlow
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/#features" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Features</Link>
          <Link to="/#solutions" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Solutions</Link>
          <Link to="/#pricing" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Pricing</Link>
          <Link to="/#contact" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Contact</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          <Link to="/login" className="hidden sm:block text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors px-4 py-2">
            Log in
          </Link>
          <Link to="/signup" className="bg-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
