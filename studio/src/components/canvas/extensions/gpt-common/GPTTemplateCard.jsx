import React from "react";
import { cn } from "@/lib/utils";
import { 
  MessageSquare, 
  FileText, 
  Database, 
  Tags, 
  Zap, 
  Braces, 
  GitBranch, 
  Lightbulb,
  Sparkles,
  PenTool,
  Search,
  Filter,
  Heart,
  TrendingUp,
  FileSearch,
  ClipboardList,
  Newspaper,
  Users,
  Mail,
  Languages,
  Globe,
  Megaphone,
  Share2,
  ShoppingBag,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Briefcase,
  Code,
  Settings,
} from "lucide-react";

const iconMap = {
  MessageSquare,
  FileText,
  Database,
  Tags,
  Zap,
  Braces,
  GitBranch,
  Lightbulb,
  Sparkles,
  PenTool,
  Search,
  Filter,
  Heart,
  TrendingUp,
  FileSearch,
  ClipboardList,
  Newspaper,
  Users,
  Mail,
  Languages,
  Globe,
  Megaphone,
  Share2,
  ShoppingBag,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Briefcase,
  Code,
  Settings,
};

const GPTTemplateCard = ({ 
  template, 
  isSelected, 
  onSelect,
  themeColor = "#6366F1",
}) => {
  const IconComponent = iconMap[template.icon] || Sparkles;
  
  return (
    <button
      type="button"
      onClick={() => onSelect(template.id)}
      className={cn(
        "flex flex-col items-start p-4 rounded-xl transition-all duration-200 text-left w-full",
        "bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
        "border-2",
        isSelected
          ? "shadow-[0_2px_12px_rgba(99,102,241,0.25)]"
          : "border-transparent hover:shadow-[0_2px_8px_rgba(0,0,0,0.12)] hover:border-gray-200"
      )}
      style={{
        borderColor: isSelected ? themeColor : undefined,
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
        style={{ backgroundColor: template.iconBg || themeColor }}
      >
        <IconComponent size={24} className="text-white" strokeWidth={2} />
      </div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">
        {template.name}
      </h3>
      <p className="text-xs text-gray-500 leading-relaxed">
        {template.description}
      </p>
    </button>
  );
};

export default GPTTemplateCard;
