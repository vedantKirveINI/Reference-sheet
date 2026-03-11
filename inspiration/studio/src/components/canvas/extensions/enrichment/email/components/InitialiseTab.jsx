import React from "react";
import { AtSign, Mail, CheckCircle, Shield, Zap, ArrowRight, CheckCircle2, Building2, User } from "lucide-react";

const InitialiseTab = () => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-[#22C55E]/10 rounded-2xl flex items-center justify-center">
          <AtSign className="w-8 h-8 text-[#22C55E]" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Email Enrichment</h2>
          <p className="text-gray-500 mt-2 max-w-md mx-auto">
            Find verified email addresses using a person's name and company domain
          </p>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#22C55E]" />
          When to use Email Enrichment
        </h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-[#22C55E] mt-0.5">•</span>
            <span><strong>Lead outreach</strong> — Find email addresses for prospects when you have their name and company</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#22C55E] mt-0.5">•</span>
            <span><strong>Contact discovery</strong> — Generate accurate email patterns based on company domain</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#22C55E] mt-0.5">•</span>
            <span><strong>CRM enrichment</strong> — Automatically fill in missing email addresses</span>
          </li>
        </ul>
      </div>

      <div className="bg-[#22C55E]/5 rounded-xl p-4 space-y-3 border border-[#22C55E]/10">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
          Data you'll receive
        </h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Mail className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Email address</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Verification status</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Shield className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Confidence score</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <AtSign className="w-3.5 h-3.5 text-[#22C55E]" />
            <span>Email pattern</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
        <h3 className="font-medium text-gray-900 text-sm">What you'll need to provide</h3>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span>Company Domain</span>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300" />
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
            <User className="w-4 h-4 text-gray-400" />
            <span>Full Name</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Use the company's main domain (e.g., "acme.com") for best results
        </p>
      </div>
    </div>
  );
};

export default InitialiseTab;
