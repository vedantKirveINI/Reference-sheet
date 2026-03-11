import React from "react";
import { User, Briefcase, MapPin, Linkedin, Mail, Zap, ArrowRight, CheckCircle2 } from "lucide-react";

const InitialiseTab = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#8B5CF6]/10 rounded-2xl flex items-center justify-center">
          <User className="w-8 h-8 text-[#8B5CF6]" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Person Enrichment</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Get detailed professional information about a person using their name and company domain
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#8B5CF6]" />
          When to use Person Enrichment
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#8B5CF6] mt-0.5">•</span>
            <span><strong>Lead qualification</strong> — Get detailed info about prospects to prioritize outreach</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#8B5CF6] mt-0.5">•</span>
            <span><strong>Contact research</strong> — Find job titles, companies, and social profiles</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#8B5CF6] mt-0.5">•</span>
            <span><strong>CRM enrichment</strong> — Automatically fill in missing contact details</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#8B5CF6]/5 rounded-xl p-4 space-y-3 border border-[#8B5CF6]/10">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#8B5CF6]" />
          Data you'll receive
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Full name & photo</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Job title & company</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Linkedin className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Social profiles</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Email address</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Location</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Briefcase className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>Work history</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
        <h3 className="font-medium text-gray-900 text-sm">What you'll need to provide</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <User className="w-4 h-4 text-gray-400" />
            <span>Full Name</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Briefcase className="w-4 h-4 text-gray-400" />
            <span>Company Domain</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Optionally add a LinkedIn URL for more accurate matching
        </p>
      </div>
    </div>
  );
};

export default InitialiseTab;
