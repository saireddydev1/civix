import { motion, useReducedMotion } from 'motion/react';

export const LiveBulletin = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 text-[11px] font-bold text-slate-300 py-1.5 px-4 overflow-hidden relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <span className="flex h-2 w-2 relative">
            <span className={`absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 ${shouldReduceMotion ? '' : 'animate-ping'}`}></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-400 font-extrabold uppercase tracking-wider text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">GHMC DRF TELEMETRY</span>
          <span className="hidden sm:inline-block text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">📞 GHMC Helpline: 040-21111111</span>
        </div>

        <div className="overflow-hidden relative w-full">
          <motion.div
            animate={shouldReduceMotion ? { x: 0 } : { x: ["100%", "-100%"] }}
            transition={shouldReduceMotion ? { duration: 0 } : { repeat: Infinity, duration: 24, ease: "linear" }}
            className="whitespace-nowrap flex items-center gap-8 text-slate-300 font-medium text-xs"
          >
            <span>🌧️ <strong>GHMC Monsoon Alert:</strong> 48 DRF Emergency Teams deployed active across Serilingampally, Khairatabad & Charminar zones.</span>
            <span>🚨 <strong>Pothole Repairs:</strong> Emergency asphalt patching teams active on Durgam Cheruvu Cable Bridge & Cyber Towers road.</span>
            <span>⚡ <strong>TSSPDCL Notice:</strong> 100% power grid uptime maintained in HITEC City & Gachibowli circles.</span>
            <span>💧 <strong>HMWSSB Update:</strong> Drinking water quality telemetry verified normal across 150 GHMC Wards.</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LiveBulletin;
