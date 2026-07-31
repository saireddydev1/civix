import { useState, FormEvent } from 'react';
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, ShieldAlert, LifeBuoy, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export const ContactUs = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 text-slate-200 space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
            <LifeBuoy className="w-4 h-4" /> Support & Citizen Help Center
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">How Can We Help You?</h1>
          <p className="text-slate-300 text-sm">
            Reach out to our municipal platform team or dial emergency helplines for urgent assistance.
          </p>
        </div>

        {/* Emergency Helplines Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 text-red-400 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
              100
            </div>
            <div>
              <div className="text-xs font-bold text-red-400">Police Control</div>
              <div className="text-sm font-black text-white">Dial 100</div>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
              101
            </div>
            <div>
              <div className="text-xs font-bold text-amber-400">Fire Services</div>
              <div className="text-sm font-black text-white">Dial 101</div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
              108
            </div>
            <div>
              <div className="text-xs font-bold text-emerald-400">Emergency Medical</div>
              <div className="text-sm font-black text-white">Dial 108</div>
            </div>
          </div>

          <div className="bg-teal-500/10 border border-teal-500/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 text-teal-400 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg">
              1100
            </div>
            <div>
              <div className="text-xs font-bold text-teal-400">Municipal Toll-Free</div>
              <div className="text-sm font-black text-white">1800-425-1100</div>
            </div>
          </div>
        </div>

        {/* Contact Form & Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
          {/* Info Column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" /> Platform Contact
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-semibold">Support Email</div>
                    <a href="mailto:support@civix.gov.in" className="text-emerald-400 font-bold hover:underline">
                      support@civix.gov.in
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneCall className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-semibold">Helpline Desk</div>
                    <div className="text-slate-200 font-bold">+91 (040) 2345-6789</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-semibold">Headquarters</div>
                    <div className="text-slate-200 font-bold">Civic Tech Hub, Tank Bund Road, Hyderabad, TG</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 border-t border-slate-800 pt-3">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-400 font-semibold">Operating Hours</div>
                    <div className="text-slate-200 font-bold">24/7 AI System Active</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Column */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 lg:p-8 lg:col-span-2">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-12 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white">Message Received!</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Thank you for reaching out. Our support team will get back to your email within 24 hours.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all"
                >
                  Send Another Message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-2">Send Us a Direct Message</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="citizen@domain.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.subject}
                    onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support / App Issue</option>
                    <option value="Department SLA Escalation">Department SLA Escalation</option>
                    <option value="Feedback">Feedback & Suggestions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Message Details</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe how we can help..."
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Send className="w-4 h-4" /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;
