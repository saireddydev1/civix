import React from 'react';
import { CheckCircle2, ShieldCheck, UserCheck, Clock, Building2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { getValidImageUrl, DEFAULT_CIVIC_IMAGE, DEFAULT_RESOLUTION_IMAGE } from '../utils/imageUtils';

interface IssueProps {
  photoUrl?: string;
  resolutionPhotoUrl?: string;
  resolvedByOfficialName?: string;
  officialName?: string;
  departmentId?: string;
  officialNotes?: string;
  resolutionNotes?: string;
  resolvedAt?: any;
  updatedAt?: any;
  title?: string;
}

export default function BeforeAfterComparison({ issue }: { issue: IssueProps }) {
  const beforePhoto = getValidImageUrl(issue.photoUrl, DEFAULT_CIVIC_IMAGE);
  const afterPhoto = getValidImageUrl(issue.resolutionPhotoUrl, DEFAULT_RESOLUTION_IMAGE);

  const officialName = issue.resolvedByOfficialName || issue.officialName || 'Er. K. Rajeshwar Rao (Field Engineer)';
  
  const getDeptBadge = (deptId?: string) => {
    switch (deptId) {
      case 'municipal': return { label: 'GHMC Municipal Governance', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
      case 'transport': return { label: 'R&B Roads & Transport Wing', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' };
      case 'electricity': return { label: 'TSSPDCL Electrical Division', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' };
      case 'water': return { label: 'HMWSSB Water Supply & Sewerage', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
      default: return { label: 'Municipal Governance Division', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' };
    }
  };

  const dept = getDeptBadge(issue.departmentId);

  const notes = issue.officialNotes || issue.resolutionNotes || 'Inspected site with official field crew. Problem remediated and quality verified by department supervisor.';

  const formattedTime = issue.resolvedAt?.toDate ? formatDistanceToNow(issue.resolvedAt.toDate()) + ' ago' :
                        issue.updatedAt?.toDate ? formatDistanceToNow(issue.updatedAt.toDate()) + ' ago' : 'Recently';

  return (
    <div className="space-y-3 my-2 font-sans">
      {/* Side-by-Side Comparison Container */}
      <div className="grid grid-cols-2 gap-2.5 bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
        {/* BEFORE Photo */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 group">
          <img 
            src={beforePhoto} 
            alt="Reported Problem Before" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_CIVIC_IMAGE;
            }}
          />
          <div className="absolute top-2 left-2 bg-red-500/90 backdrop-blur-md text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
            <span>🔴</span> BEFORE
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-[9px] text-slate-300 px-2 py-1 rounded line-clamp-1 font-mono">
            Reported Problem
          </div>
        </div>

        {/* AFTER Photo */}
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 group">
          <img 
            src={afterPhoto} 
            alt="Fixed Resolution After" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = DEFAULT_RESOLUTION_IMAGE;
            }}
          />
          <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-md text-slate-950 text-[9px] font-extrabold px-2 py-0.5 rounded-md flex items-center gap-1 shadow-lg">
            <span>🟢</span> AFTER
          </div>
          <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-xs text-[9px] text-emerald-300 px-2 py-1 rounded line-clamp-1 font-mono font-bold">
            Fixed by Department
          </div>
        </div>
      </div>

      {/* Official Reply Card */}
      <div className="bg-slate-950/90 border border-emerald-500/20 rounded-2xl p-4 space-y-3 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-white flex items-center gap-1.5">
                {officialName}
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-slate-500" />
                <span>Resolved {formattedTime}</span>
              </div>
            </div>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${dept.color}`}>
            {dept.label}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
            💬 Official Reply & Action Report
          </span>
          <p className="text-xs text-slate-300 leading-relaxed font-medium italic">
            "{notes}"
          </p>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[10px] text-slate-400 font-medium">
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified Government Resolution Seal
          </span>
          <span className="font-mono text-slate-500">ID: CIVIX-RES-OK</span>
        </div>
      </div>
    </div>
  );
}
