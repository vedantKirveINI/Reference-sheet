import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { icons } from "@/components/icons";
import { cn } from "@/lib/utils";

const FORUM_URL = "https://forum.tinycommand.com/";
const HERO_IMAGE_URL =
  "https://ccc.oute.app/test/1737610083080/help_and_resource_bg.webp";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.06 },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0 },
};

const categories = [
  {
    title: "Help",
    description:
      "Get assistance with using TinyCommand, troubleshoot issues, and find solutions.",
    iconKey: "supportAgent",
    iconBg: "bg-primary/10 text-primary",
    href: "https://forum.tinycommand.com/c/help/10",
  },
  {
    title: "FAQ",
    description:
      "Find solutions fast. This FAQ covers common questions about using the platform.",
    iconKey: "helpCircle",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    href: "https://forum.tinycommand.com/c/faq/11",
  },
  {
    title: "General",
    description:
      "Discuss anything related to TinyCommand, share insights, and connect with others.",
    iconKey: "messageCircle",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    href: "https://forum.tinycommand.com/c/general/4",
  },
  {
    title: "Site Feedback",
    description:
      "Discussion about this site, its organization, how it works, and suggestions for improvement.",
    iconKey: "monitor",
    iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    href: "https://forum.tinycommand.com/c/site-feedback/2",
  },
  {
    title: "Show & Tell",
    description:
      "Showcase your projects and workflows created with TinyCommand.",
    iconKey: "layoutGrid",
    iconBg: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
    href: "https://forum.tinycommand.com/c/show-tell/5",
  },
  {
    title: "Resources",
    description:
      "Access guides, tutorials, and best practices to maximize your experience.",
    iconKey: "bookOpen",
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    href: "https://forum.tinycommand.com/c/resources/8",
  },
  {
    title: "What's New?",
    description:
      "Stay updated with the latest features, enhancements, and announcements.",
    iconKey: "sparkles",
    iconBg: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
    href: "https://forum.tinycommand.com/c/whats-new/9",
  },
];

function CategoryIcon({ iconKey, iconBg }) {
  const IconComponent = icons[iconKey];
  if (!IconComponent) return null;
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
        iconBg
      )}
    >
      <IconComponent className="size-5" />
    </span>
  );
}

export default function HelpAndResources() {
  return (
    <div className="flex h-full flex-col overflow-y-auto p-4">
      {/* Hero — image as background with overlay; text has weight on top */}
      <motion.section
        className="relative mb-4 min-h-[160px] overflow-hidden rounded-lg border border-border"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
          aria-hidden
        />
        {/* Gradient overlay so text stays readable and has weight */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/50 to-black/30"
          aria-hidden
        />
        {/* Content — high contrast for emphasis */}
        <div className="relative z-10 flex h-full min-h-[160px] flex-col justify-end p-4">
          <h2 className="text-lg font-semibold text-white drop-shadow-sm">
            Explore the community
          </h2>
          <p className="mt-1 max-w-md text-sm text-white/95 drop-shadow-sm">
            Connect, share ideas, and get help from other users.
          </p>
          <a
            href={FORUM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block w-fit"
          >
            <Button
              variant="secondary"
              size="sm"
              className="bg-white text-foreground hover:bg-white/90"
            >
              Open forum
            </Button>
          </a>
        </div>
      </motion.section>

      {/* Categories — staggered */}
      <motion.div
        className="grid gap-2 sm:grid-cols-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {categories.map((category) => (
          <motion.a
            key={category.title}
            href={category.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors",
              "hover:bg-muted/50 hover:border-muted-foreground/20",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            )}
            variants={item}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <CategoryIcon iconKey={category.iconKey} iconBg={category.iconBg} />
            <div className="min-w-0 flex-1">
              <span className="text-sm font-semibold text-foreground">
                {category.title}
              </span>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {category.description}
              </p>
            </div>
          </motion.a>
        ))}
      </motion.div>
    </div>
  );
}
