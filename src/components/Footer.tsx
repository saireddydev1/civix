import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Github, Twitter, Mail, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
          
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/feed" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck className="text-slate-950 w-4 h-4 font-bold" />
              </div>
              <span className="text-lg font-black tracking-tight text-white">Civix</span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Empowering citizens and municipal departments to report, track, and resolve city infrastructure issues with AI guidance and real-time SLAs.
            </p>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              All Municipal API Systems Operational
            </div>
          </div>

          {/* Quick Platform Links */}
          <div className="space-y-3">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">Platform</div>
            <ul className="space-y-2 font-medium">
              <li><Link to="/feed" className="hover:text-emerald-400 transition-colors">Community Feed</Link></li>
              <li><Link to="/report" className="hover:text-emerald-400 transition-colors">Report an Issue</Link></li>
              <li><Link to="/map" className="hover:text-emerald-400 transition-colors">Interactive City Map</Link></li>
              <li><Link to="/analytics" className="hover:text-emerald-400 transition-colors">City Analytics</Link></li>
              <li><Link to="/leaderboard" className="hover:text-emerald-400 transition-colors">Citizen Leaderboard</Link></li>
            </ul>
          </div>

          {/* Company & Platform */}
          <div className="space-y-3">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">About & Governance</div>
            <ul className="space-y-2 font-medium">
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About Us & Mission</Link></li>
              <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact & Helplines</Link></li>
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Emergency & Municipal */}
          <div className="space-y-3">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">Municipal Portals</div>
            <ul className="space-y-2 font-medium">
              <li><Link to="/department" className="hover:text-emerald-400 transition-colors flex items-center gap-1">Department Login <ArrowUpRight className="w-3 h-3 text-slate-500" /></Link></li>
              <li><a href="https://ghmc.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">GHMC Official Portal <ArrowUpRight className="w-3 h-3 text-slate-500" /></a></li>
              <li><a href="https://tssouthernpower.com" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">TSSPDCL Power <ArrowUpRight className="w-3 h-3 text-slate-500" /></a></li>
              <li><a href="https://hyderabadwater.gov.in" target="_blank" rel="noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1">HMWSSB Water <ArrowUpRight className="w-3 h-3 text-slate-500" /></a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-slate-500 text-xs">
            © {new Date().getFullYear()} Civix Civic Tech Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-300 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-slate-300 transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-slate-300 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
