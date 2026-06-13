/**
 * Opinionated micro-copy — premium apps have voice.
 * Pull from these when wiring empty states, loaders, errors.
 */

export const EMPTY_COPY = {
  generic: {
    title: "Nothing here yet",
    description: "It's quiet. Suspiciously quiet. Add the first one and we'll get this party started.",
  },
  search: {
    title: "Nothing matches that",
    description: "Try fewer letters, or different ones. Spelling is a vibe, not a rule.",
  },
  notifications: {
    title: "Inbox zero",
    description: "All caught up. Go touch grass — we'll ping you when something matters.",
  },
  tasks: {
    title: "No tasks. None.",
    description: "Either you're crushing it or someone forgot to assign you something. Either way, enjoy it.",
  },
  team: {
    title: "Just you in here",
    description: "Invite a teammate — collaboration is the original superpower.",
  },
  data: {
    title: "Nothing to plot",
    description: "We need a few data points before this starts looking like a chart.",
  },
} as const;

export const LOADING_COPY = [
  "Warming up the pixels…",
  "Cooking your numbers…",
  "Asking the database nicely…",
  "Polishing the gradients…",
  "Reticulating splines…",
];

export const SUCCESS_COPY = [
  "Done. Smooth.",
  "Saved. Like it was nothing.",
  "Locked in.",
  "Crisp.",
];