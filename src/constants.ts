export const DEPARTMENTS = [
  { id: 'municipal', name: 'Municipal Administration', icon: 'Building2' },
  { id: 'transport', name: 'Road Transport', icon: 'Truck' },
  { id: 'electricity', name: 'Electricity Board', icon: 'Zap' },
  { id: 'water', name: 'Water Works', icon: 'Droplets' },
  { id: 'education', name: 'Education Department', icon: 'GraduationCap' },
  { id: 'health', name: 'Health Department', icon: 'HeartPulse' }
];

export const ISSUE_CATEGORIES = [
  { id: 'pothole', name: 'Pothole', icon: 'AlertCircle' },
  { id: 'garbage', name: 'Garbage/Waste', icon: 'Trash2' },
  { id: 'water', name: 'Water Leakage', icon: 'Droplets' },
  { id: 'electricity', name: 'Power Issue', icon: 'Zap' },
  { id: 'drainage', name: 'Drainage Block', icon: 'Waves' },
  { id: 'street-light', name: 'Street Light', icon: 'Sun' },
  { id: 'other', name: 'Other', icon: 'MoreHorizontal' }
];

export const ISSUE_STATUSES = [
  { id: 'open', name: 'Open', color: 'bg-zinc-100 text-zinc-700' },
  { id: 'in-progress', name: 'In Progress', color: 'bg-amber-100 text-amber-700' },
  { id: 'resolved', name: 'Resolved', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'closed', name: 'Closed', color: 'bg-red-100 text-red-700' }
];

export const GHMC_ZONES = [
  { id: 'all', name: 'All Hyderabad', circles: '30 Circles | 150 Wards' },
  { id: 'khairatabad', name: 'Khairatabad Zone', circles: 'Banjara Hills, Jubilee Hills, Somajiguda, Ameerpet', activeIssues: 42, resolvedPct: 98.4 },
  { id: 'serilingampally', name: 'Serilingampally Zone', circles: 'HITEC City, Gachibowli, Kondapur, Madhapur', activeIssues: 58, resolvedPct: 99.1 },
  { id: 'secunderabad', name: 'Secunderabad Zone', circles: 'Begumpet, Marredpally, Tarnaka, Alwal', activeIssues: 31, resolvedPct: 97.8 },
  { id: 'kukatpally', name: 'Kukatpally Zone', circles: 'KPHB Colony, Miyapur, Pragathi Nagar, Moosapet', activeIssues: 49, resolvedPct: 98.2 },
  { id: 'lbnagar', name: 'LB Nagar Zone', circles: 'Dilsukhnagar, Saroornagar, Hayathnagar, Vanasthalipuram', activeIssues: 37, resolvedPct: 96.9 },
  { id: 'charminar', name: 'Charminar Zone', circles: 'Old City, Bahadurpura, Malakpet, Santoshnagar', activeIssues: 53, resolvedPct: 95.8 }
];

export const GHMC_EMERGENCY_HELPLINES = {
  controlRoom: '040-21111111',
  drfHotline: '040-22222222',
  hmwssbWater: '155313',
  tsspdclPower: '1912',
  drfTeamsDeployed: 48,
  activeMonsoonAlert: 'DRF Monsoon Squads On Duty across HITEC City, Begumpet & Old City'
};

export const GHMC_QUICK_ACTIONS = [
  { id: 'pothole', title: 'Road Potholes', desc: 'GHMC Engineering Wing', category: 'pothole', departmentId: 'transport', bgGradient: 'from-amber-500/20 to-orange-500/10', border: 'border-amber-500/30', badgeColor: 'bg-amber-500/20 text-amber-400' },
  { id: 'drainage', title: 'Waterlogging & Drains', desc: 'GHMC Monsoon DRF Squad', category: 'drainage', departmentId: 'water', bgGradient: 'from-cyan-500/20 to-blue-500/10', border: 'border-cyan-500/30', badgeColor: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'garbage', title: 'Waste & Sanitation', desc: 'Swachh GHMC Sanitation', category: 'garbage', departmentId: 'municipal', bgGradient: 'from-emerald-500/20 to-teal-500/10', border: 'border-emerald-500/30', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'street-light', title: 'Street Light Failures', desc: 'Electrical & Energy Cell', category: 'street-light', departmentId: 'electricity', bgGradient: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-500/30', badgeColor: 'bg-yellow-500/20 text-yellow-400' }
];

