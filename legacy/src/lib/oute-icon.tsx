import React from "react";
import {
  Trash2,
  X,
  Search,
  Share2,
  Info,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Check,
  Link,
  Link2,
  HelpCircle,
  Headphones,
  Plus,
  Pencil,
  Copy,
  Filter,
  ArrowUpDown,
  Layers,
  EyeOff,
  Eye,
  Table,
  Columns3,
  MoreVertical,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Settings,
  Download,
  Upload,
  RefreshCw,
  Star,
  Sheet,
  GripVertical,
  Lock,
  Unlock,
  Calendar,
  Clock,
  Paperclip,
  Image,
  File,
  Folder,
  User,
  Users,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Crown,
  Heart,
  ThumbsUp,
  Trophy,
  Smile,
  FileSpreadsheet,
  type LucideProps,
} from "lucide-react";

type IconComponent = React.FC<LucideProps>;

const iconMap: Record<string, IconComponent> = {
  OUTETrashIcon: Trash2,
  OUTECloseIcon: X,
  OUTESearchIcon: Search,
  OUTEShareIcon: Share2,
  OUTEInfoIcon: Info,
  OUTEExpandMoreIcon: ChevronDown,
  OUTEChevronLeftIcon: ChevronLeft,
  OUTEChevronRightIcon: ChevronRight,
  OUTEDoneIcon: Check,
  OUTEInsertLinkIcon: Link,
  OUTEHelpIcon: HelpCircle,
  OUTESupportAgentIcon: Headphones,
  OUTEAddIcon: Plus,
  CheckIcon: Check,
  OUTEEditIcon: Pencil,
  OUTEDeleteIcon: Trash2,
  OUTEContentCopyIcon: Copy,
  OUTEFilterListIcon: Filter,
  OUTESortIcon: ArrowUpDown,
  OUTEGroupWorkIcon: Layers,
  OUTEVisibilityOffIcon: EyeOff,
  OUTETableChartIcon: Table,
  OUTEViewKanbanIcon: Columns3,
  OUTEMoreVertIcon: MoreVertical,
  OUTEMoreHorizIcon: MoreHorizontal,
  OUTEArrowBackIcon: ArrowLeft,
  OUTEArrowForwardIcon: ArrowRight,
  OUTEWarningIcon: AlertTriangle,
  OUTECheckCircleIcon: CheckCircle,
  OUTESettingsIcon: Settings,
  OUTEDownloadIcon: Download,
  OUTEUploadIcon: Upload,
  OUTERefreshIcon: RefreshCw,
  OUTEStarIcon: Star,
  OUTEStarBorderIcon: Star,
  TINYSheetIcon: Sheet,
  OUTEDragIndicatorIcon: GripVertical,
  OUTEVisibilityIcon: Eye,
  OUTELockIcon: Lock,
  OUTEUnlockIcon: Unlock,
  OUTECalendarIcon: Calendar,
  OUTEAccessTimeIcon: Clock,
  OUTEAttachFileIcon: Paperclip,
  OUTEImageIcon: Image,
  OUTEFileIcon: File,
  OUTEFolderIcon: Folder,
  OUTEPersonIcon: User,
  OUTEPeopleIcon: Users,
  OUTEEmailIcon: Mail,
  OUTEPhoneIcon: Phone,
  OUTELocationOnIcon: MapPin,
  OUTELinkIcon: Link2,
  OUTEKeyboardArrowDownIcon: ChevronDown,
  OUTEKeyboardArrowUpIcon: ChevronUp,
  OUTEArrowDropDownIcon: ChevronDown,
  OUTEOpenInNewIcon: ExternalLink,
  OUTECrownIcon: Crown,
  OUTEHeartIcon: Heart,
  OUTEThumbUpIcon: ThumbsUp,
  OUTECupIcon: Trophy,
  OUTESmileIcon: Smile,
  XlsxIcon: FileSpreadsheet,
};

interface ImagePropsType {
  src?: string;
  alt?: string;
  className?: string;
}

interface ODSIconProps extends React.HTMLAttributes<HTMLDivElement> {
  outeIconName?: string;
  outeIconProps?: {
    sx?: any;
    size?: number;
    className?: string;
  };
  imageProps?: ImagePropsType;
}

export function ODSIcon({
  outeIconName,
  outeIconProps,
  imageProps,
  className,
  ...rest
}: ODSIconProps) {
  if (imageProps?.src) {
    return (
      <div
        className={`inline-flex items-center justify-center ${className ?? ""}`}
        {...rest}
      >
        <img
          src={imageProps.src}
          alt={imageProps.alt ?? ""}
          className={imageProps.className ?? ""}
        />
      </div>
    );
  }

  const size = outeIconProps?.size ?? 20;
  const iconClassName = outeIconProps?.className;
  const IconComp = outeIconName ? iconMap[outeIconName] : undefined;

  if (!IconComp) {
    return (
      <div
        className={`inline-flex items-center justify-center ${className ?? ""}`}
        {...rest}
      >
        <span
          className={`inline-block rounded-full bg-muted ${iconClassName ?? ""}`}
          style={{ width: size, height: size }}
        />
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center justify-center ${className ?? ""}`}
      {...rest}
    >
      <IconComp size={size} className={iconClassName} />
    </div>
  );
}

export { ODSIcon as Icon };
export default ODSIcon;
