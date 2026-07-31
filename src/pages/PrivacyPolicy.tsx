import { Shield, Lock, Eye, FileText, Database, UserCheck } from 'lucide-react';
import { motion } from 'motion/react';

export const PrivacyPolicy = () => {
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
            <Shield className="w-4 h-4" /> Legal & Governance
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
          <p className="text-slate-400 mt-2 text-sm">Last updated: July 31, 2026</p>
        </div>

        {/* Introduction */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 leading-relaxed space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-emerald-400" /> Commitment to Citizen Privacy
          </h2>
          <p className="text-slate-300 text-sm">
            At <strong>Civix</strong>, we take data privacy and civic security with maximum responsibility. This Privacy Policy outlines how our platform collects, uses, protects, and stores information when you use our civic issue reporting system and municipal services.
          </p>
        </div>

        {/* Key Sections */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-teal-400" /> 1. Information We Collect
            </h3>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 pl-2">
              <td><strong>Account Information:</strong> Full name, email address, profile credentials, and selected role.</td>
              <td><strong>Geospatial & Report Data:</strong> Precise GPS coordinates, addresses, issue photographs, titles, descriptions, and category tags provided during issue submission.</td>
              <td><strong>Device & Usage Data:</strong> Browser types, IP addresses, and interaction logs strictly used for security auditing and platform diagnostics.</td>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-400" /> 2. How We Use Your Data
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your reported issue data is processed using Google Gemini & Groq AI algorithms to categorize urgency and route tasks directly to responsible municipal municipal departments (GHMC, TSSPDCL, HMWSSB, etc.).
            </p>
            <ul className="list-disc list-inside text-sm text-slate-300 space-y-2 pl-2">
              <td>Public feeds display issue location and details to inform fellow citizens without exposing private personal details.</td>
              <td>Municipal officials receive task notifications to track Service Level Agreements (SLAs).</td>
            </ul>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" /> 3. Data Protection & Security
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              All user data is encrypted in transit and at rest using Firebase Firestore security rules and HTTPS protocols. We never sell, lease, or monetize citizen data to third-party commercial entities.
            </p>
          </div>

          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 space-y-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> 4. Your Rights & Choices
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Citizens retain the right to request deletion of their account profile or submitted issue reports at any time by contacting support at <a href="mailto:privacy@civix.gov.in" className="text-emerald-400 underline font-medium">privacy@civix.gov.in</a>.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PrivacyPolicy;
