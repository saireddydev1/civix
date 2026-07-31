import { FileCheck, AlertTriangle, Scale, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

export const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-slate-200">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="border-b border-slate-800 pb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold mb-4">
            <Scale className="w-4 h-4" /> Terms & Governance
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Terms of Service</h1>
          <p className="text-slate-400 mt-2 text-sm">Last updated: July 31, 2026</p>
        </div>

        {/* Introduction */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 leading-relaxed space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-emerald-400" /> Platform Usage Agreement
          </h2>
          <p className="text-slate-300 text-sm">
            By accessing or using <strong>Civix</strong>, you agree to comply with and be bound by these Terms of Service. Civix is designed for constructive citizen reporting and municipal coordination.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-teal-400" /> 1. Acceptable Citizen Conduct
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 pl-2">
              <td>Submissions must reflect genuine civic issues (potholes, streetlights, garbage, water leaks, traffic hazards).</td>
              <td>Photos attached to reports must be genuine pictures of the reported location.</td>
              <td>Respectful language must be maintained in community comments and upvote discussions.</td>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-400" /> 2. Prohibited Actions & Misuse
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 pl-2">
              <td>Filing false or malicious reports, spamming, or submitting offensive/obscene content.</td>
              <td>Attempting to impersonate municipal officials or unauthorized administrative access.</td>
              <td>Misusing emergency alert systems for non-urgent notifications.</td>
            </ul>
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-semibold mt-2">
              ⚠️ Accounts engaged in deliberate spam or fraudulent reporting will be suspended immediately.
            </div>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" /> 3. Service Level Agreements & Disclaimers
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              While Civix routes reported tasks directly to corresponding municipal departments, estimated resolution times (SLAs) depend on department bandwidth, weather conditions, and emergency prioritizations.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TermsOfService;
