/**
 * TinyTable Embed – Route entry point
 *
 * Validates the embed request and renders the embed wrapper.
 * Accessible at /embed?type=table
 */

import { useSearchParams } from "react-router-dom";
import { EmbedWrapper } from "./EmbedWrapper";

const VALID_TYPES = new Set(["table"]);

export function EmbedRoute() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");

  if (!type || !VALID_TYPES.has(type)) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div className="text-center space-y-2">
          <p className="text-sm font-medium text-destructive">
            Invalid embed type
          </p>
          <p className="text-xs text-muted-foreground">
            Expected: /embed?type=table
          </p>
        </div>
      </div>
    );
  }

  return <EmbedWrapper />;
}
