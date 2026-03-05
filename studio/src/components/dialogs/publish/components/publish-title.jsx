import { FileText } from "lucide-react";

export const PublishTitle = ({ title }) => {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200"
      data-testid="publish-title-container"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-zinc-100 rounded-lg">
        <FileText className="w-4 h-4 text-zinc-600" />
      </div>
      <h2
        className="text-lg font-semibold text-zinc-900 truncate max-w-[20rem]"
        data-testid="publish-title-text"
      >
        Publish {title}
      </h2>
    </div>
  );
};
