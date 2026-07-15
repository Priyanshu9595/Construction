import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";
import { ArrowRight, HardHat, Shield, Activity, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-[600px] h-[600px] bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-[500px] h-[500px] bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            BuildFlow 2.0 is now live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Build the Future with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
              AI-Powered Management
            </span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The ultimate ERP system for construction. Track progress, monitor safety with AI, and manage budgets in real-time all in one place.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link to="/signup" className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <Link to="/login" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 rounded-xl font-bold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center">
              View Demo
            </Link>
          </div>
        </div>
        
        {/* Dashboard Preview Image */}
        <div className="max-w-6xl mx-auto mt-20 relative animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
           <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-transparent to-transparent z-10"></div>
           <div className="rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden bg-white">
              {/* CSS Mock Dashboard instead of Image */}
              <div className="w-full h-[500px] bg-slate-50 flex flex-col">
                <div className="h-12 border-b border-slate-200 bg-white flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                  <div className="ml-4 w-64 h-6 bg-slate-100 rounded-md"></div>
                </div>
                <div className="flex-1 p-8 flex gap-6">
                  <div className="hidden md:block w-64 bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-4">
                    <div className="w-full h-8 bg-slate-100 rounded"></div>
                    <div className="w-3/4 h-8 bg-slate-100 rounded"></div>
                    <div className="w-full h-8 bg-slate-100 rounded"></div>
                    <div className="w-5/6 h-8 bg-slate-100 rounded"></div>
                  </div>
                  <div className="flex-1 flex flex-col gap-6">
                    <div className="h-32 bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex gap-4">
                       <div className="flex-1 h-full bg-blue-50/50 border border-blue-100 rounded-lg"></div>
                       <div className="flex-1 h-full bg-emerald-50/50 border border-emerald-100 rounded-lg"></div>
                       <div className="flex-1 h-full bg-orange-50/50 border border-orange-100 rounded-lg"></div>
                    </div>
                    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                       <div className="w-full h-full bg-slate-50 rounded-lg border border-slate-100 border-dashed"></div>
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Everything you need to build better</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">BuildFlow replaces 5 different tools with one seamless, AI-powered platform designed specifically for the construction industry.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <HardHat size={32} className="text-orange-500" />, title: "Live Site Management", desc: "Track daily progress, weather conditions, and labour attendance in real-time." },
              { icon: <Shield size={32} className="text-emerald-500" />, title: "AI Safety Monitor", desc: "Automatically detect PPE violations and safety hazards using camera feeds." },
              { icon: <Activity size={32} className="text-blue-500" />, title: "Smart Budgeting", desc: "Forecast material costs and predict budget overruns before they happen." }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Premium Footer */}
      <footer id="contact" className="bg-white text-slate-500 py-16 px-6 border-t border-slate-200 mt-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
           <div className="col-span-1 md:col-span-1">
             <div className="flex items-center gap-2 mb-4">
               <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                 <Building2 className="text-white" size={18} />
               </div>
               <span className="text-xl font-bold text-slate-900">BuildFlow</span>
             </div>
             <p className="text-sm leading-relaxed">The modern ERP for construction. Build better, faster, and safer with AI-powered management.</p>
           </div>
           
           <div>
             <h4 className="font-semibold text-slate-900 mb-4">Product</h4>
             <ul className="space-y-3 text-sm">
               <li><Link to="/#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
               <li><Link to="/#solutions" className="hover:text-blue-600 transition-colors">Integrations</Link></li>
               <li><Link to="/#pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
               <li><Link to="/login" className="hover:text-blue-600 transition-colors">Changelog</Link></li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-semibold text-slate-900 mb-4">Company</h4>
             <ul className="space-y-3 text-sm">
               <li><Link to="/#features" className="hover:text-blue-600 transition-colors">About Us</Link></li>
               <li><Link to="/signup" className="hover:text-blue-600 transition-colors">Careers</Link></li>
               <li><Link to="/#solutions" className="hover:text-blue-600 transition-colors">Blog</Link></li>
               <li><Link to="/#contact" className="hover:text-blue-600 transition-colors">Contact</Link></li>
             </ul>
           </div>
           
           <div>
             <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
             <ul className="space-y-3 text-sm">
               <li><Link to="/signup" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
               <li><Link to="/signup" className="hover:text-blue-600 transition-colors">Terms of Service</Link></li>
             </ul>
           </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
           <p className="text-sm">© 2026 BuildFlow ERP. All rights reserved.</p>
           <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"></div>
             <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"></div>
           </div>
        </div>
      </footer>
    </div>
  );
}
