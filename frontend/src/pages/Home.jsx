import { Link } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#111111] font-sans selection:bg-[#ffd000] selection:text-black">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase mb-8 leading-[0.9]">
            Construction Hub
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mb-12 font-medium leading-relaxed">
            A unified cloud-native operating system for construction project
            delivery, connecting planning, labor, and finance in one accountable
            platform.
          </p>

          <Link
            to="/login"
            className="inline-block px-8 py-4 bg-[#ffd000] text-black font-black uppercase tracking-wider text-sm hover:bg-yellow-400 transition-colors"
          >
            Explore the platform
          </Link>
        </div>
      </section>

      {/* Grayscale Divider Image */}
      <section className="w-full">
        <img
          src="/construction-framework.png"
          alt="Construction Framework"
          className="w-full h-[300px] md:h-[600px] object-cover border-t border-b border-zinc-800"
        />
      </section>

      {/* Core Modules Section */}
      <section
        id="solutions"
        className="py-24 px-6 border-b border-zinc-800 bg-[#111111]"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-16">
            Core Modules
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Planning */}
            <div className="border border-dashed border-zinc-700 p-8 flex flex-col hover:border-yellow-400 transition-colors group">
              <span className="text-3xl font-black text-[#ffd000] mb-4">
                01
              </span>
              <h3 className="text-2xl font-black text-white mb-6 uppercase">
                Planning
              </h3>
              <div className="w-full h-px border-b border-dashed border-zinc-700 mb-6 group-hover:border-yellow-400 transition-colors"></div>
              <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
                Unified project architecture and digital blueprints for total
                operational visibility.
              </p>
              <Link
                to="/login"
                className="self-start border border-[#ffd000] text-[#ffd000] px-6 py-2 font-bold text-sm hover:bg-[#ffd000] hover:text-black transition-colors"
              >
                View Blueprint
              </Link>
            </div>

            {/* Labor */}
            <div className="border border-dashed border-zinc-700 p-8 flex flex-col hover:border-yellow-400 transition-colors group">
              <span className="text-3xl font-black text-[#ffd000] mb-4">
                02
              </span>
              <h3 className="text-2xl font-black text-white mb-6 uppercase">
                Labor
              </h3>
              <div className="w-full h-px border-b border-dashed border-zinc-700 mb-6 group-hover:border-yellow-400 transition-colors"></div>
              <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
                Real-time workforce management and accountability tracking
                across all project sites.
              </p>
              <Link
                to="/login"
                className="self-start border border-[#ffd000] text-[#ffd000] px-6 py-2 font-bold text-sm hover:bg-[#ffd000] hover:text-black transition-colors"
              >
                Manage Workforce
              </Link>
            </div>

            {/* Materials */}
            <div className="border border-dashed border-zinc-700 p-8 flex flex-col hover:border-yellow-400 transition-colors group">
              <span className="text-3xl font-black text-[#ffd000] mb-4">
                03
              </span>
              <h3 className="text-2xl font-black text-white mb-6 uppercase">
                Materials
              </h3>
              <div className="w-full h-px border-b border-dashed border-zinc-700 mb-6 group-hover:border-yellow-400 transition-colors"></div>
              <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
                Integrated procurement and inventory tracking to eliminate
                supply chain bottlenecks.
              </p>
              <Link
                to="/login"
                className="self-start border border-[#ffd000] text-[#ffd000] px-6 py-2 font-bold text-sm hover:bg-[#ffd000] hover:text-black transition-colors"
              >
                Track Inventory
              </Link>
            </div>

            {/* Finance */}
            <div className="border border-dashed border-zinc-700 p-8 flex flex-col hover:border-yellow-400 transition-colors group">
              <span className="text-3xl font-black text-[#ffd000] mb-4">
                04
              </span>
              <h3 className="text-2xl font-black text-white mb-6 uppercase">
                Finance
              </h3>
              <div className="w-full h-px border-b border-dashed border-zinc-700 mb-6 group-hover:border-yellow-400 transition-colors"></div>
              <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
                Automated financial reconciliation and real-time cost
                forecasting for every project.
              </p>
              <Link
                to="/login"
                className="self-start border border-[#ffd000] text-[#ffd000] px-6 py-2 font-bold text-sm hover:bg-[#ffd000] hover:text-black transition-colors"
              >
                View Budgets
              </Link>
            </div>

            {/* Subcontractors */}
            <div className="border border-dashed border-zinc-700 p-8 flex flex-col hover:border-yellow-400 transition-colors group">
              <span className="text-3xl font-black text-[#ffd000] mb-4">
                05
              </span>
              <h3 className="text-2xl font-black text-white mb-6 uppercase">
                Subcontractors
              </h3>
              <div className="w-full h-px border-b border-dashed border-zinc-700 mb-6 group-hover:border-yellow-400 transition-colors"></div>
              <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
                Centralized vendor management and performance tracking for
                seamless delivery.
              </p>
              <Link
                to="/login"
                className="self-start border border-[#ffd000] text-[#ffd000] px-6 py-2 font-bold text-sm hover:bg-[#ffd000] hover:text-black transition-colors"
              >
                Manage Vendors
              </Link>
            </div>

            {/* Quality */}
            <div className="border border-dashed border-zinc-700 p-8 flex flex-col hover:border-yellow-400 transition-colors group">
              <span className="text-3xl font-black text-[#ffd000] mb-4">
                06
              </span>
              <h3 className="text-2xl font-black text-white mb-6 uppercase">
                Quality
              </h3>
              <div className="w-full h-px border-b border-dashed border-zinc-700 mb-6 group-hover:border-yellow-400 transition-colors"></div>
              <p className="text-zinc-400 mb-8 flex-1 leading-relaxed">
                Integrated quality assurance protocols and compliance monitoring
                for every phase.
              </p>
              <Link
                to="/login"
                className="self-start border border-[#ffd000] text-[#ffd000] px-6 py-2 font-bold text-sm hover:bg-[#ffd000] hover:text-black transition-colors"
              >
                Ensure Quality
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Benefits Section */}
      <section id="features" className="py-24 px-6 bg-[#161616]">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none mb-8">
              Platform
              <br />
              Benefits
            </h2>
            <p className="text-xl text-zinc-300 mb-10 leading-relaxed max-w-lg">
              Connect planning, labor, and finance in one accountable
              cloud-native OS for seamless project delivery.
            </p>
            <Link
              to="/login"
              className="inline-block px-8 py-4 bg-[#ffd000] text-black font-black uppercase tracking-wider text-sm hover:bg-yellow-400 transition-colors"
            >
              Explore Platform
            </Link>
          </div>
          <div className="lg:w-1/2 w-full">
            <img
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              className="w-full h-auto object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#0a0a0a] border-t border-zinc-800 py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
              Ready to sync
              <br />
              projects?
            </h2>
            <div className="w-24 h-1 bg-[#ffd000] mt-8"></div>
          </div>
          <Link
            to="/login"
            className="text-[#ffd000] font-black uppercase tracking-wider text-xl hover:text-yellow-400 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </section>

      {/* Dark Footer */}
      <footer
        id="contact"
        className="bg-[#0a0a0a] pt-16 pb-8 px-6 text-white border-t border-zinc-900"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-16">
            <div className="text-4xl font-black uppercase tracking-tighter">
              Construction Hub
            </div>

            <div className="flex flex-col md:flex-row gap-16">
              <div>
                <h4 className="font-black text-[#ffd000] uppercase tracking-wider mb-4">
                  Contact
                </h4>
                <a
                  href="mailto:support@constructionhub.io"
                  className="text-sm font-medium hover:text-yellow-400 transition-colors"
                >
                  support@constructionhub.io
                </a>
              </div>
              <div>
                <h4 className="font-black text-[#ffd000] uppercase tracking-wider mb-4">
                  Follow
                </h4>
                <div className="flex items-center gap-3">
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center hover:opacity-80 text-xs font-bold"
                  >
                    FB
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center hover:opacity-80 text-xs font-bold"
                  >
                    IG
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center hover:opacity-80 text-xs font-bold"
                  >
                    YT
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center hover:opacity-80 text-xs font-bold"
                  >
                    X
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center hover:opacity-80 text-xs font-bold"
                  >
                    IN
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-black border border-zinc-700 flex items-center justify-center hover:opacity-80 text-xs font-bold"
                  >
                    GH
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            <p>© 2026 Construction Hub. All rights reserved.</p>
            <p>Operating System for Construction</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
