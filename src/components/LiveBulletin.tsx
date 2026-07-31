import { motion } from 'motion/react';

export const LiveBulletin = () => {
  return (
    <div className="bg-slate-950 border-b border-slate-800/80 text-[11px] font-bold text-slate-300 py-1.5 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-extrabold uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LIVE CITY BULLETIN</span>
        </div>

        <div className="overflow-hidden relative w-full">
          <motion.div
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="whitespace-nowrap flex items-center gap-8 text-slate-300 font-medium"
          >
            <span>🚨 <strong>GHMC Alert:</strong> Automated pothole & drainage repair teams dispatched across Kukatpally & Banjara Hills.</span>
            <span>⚡ <strong>TSSPDCL Notice:</strong> Power restoration complete in Madhapur sector 4 (SLA &lt; 14 Mins).</span>
            <span>💧 <strong>HMWSSB Update:</strong> Water pipeline pressure monitoring active in Jubilee Hills Zone 2.</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LiveBulletin;
