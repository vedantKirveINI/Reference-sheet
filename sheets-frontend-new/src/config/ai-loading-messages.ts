const AI_LOADING_MESSAGES = [
  'Thinking hard…',
  'Brewing insights…',
  'Crunching neurons…',
  'Stirring the data…',
  'Sprinkling magic…',
  'Connecting dots…',
  'Warming up the AI…',
  'Cooking up answers…',
  'Reading the stars…',
  'Polishing results…',
  'Almost there…',
  'Summoning wisdom…',
  'Doing the math…',
  'Weaving patterns…',
  'Sharpening pencils…',
  'Consulting the oracle…',
  'Mixing ingredients…',
  'Tuning the engines…',
  'Painting the canvas…',
  'Dusting off neurons…',
] as const;

let _index = Math.floor(Math.random() * AI_LOADING_MESSAGES.length);

/**
 * Returns a quirky loading message. Cycles through the list so
 * consecutive calls (e.g. from different cells) get varied text.
 */
export function getAiLoadingMessage(): string {
  const msg = AI_LOADING_MESSAGES[_index % AI_LOADING_MESSAGES.length];
  _index++;
  return msg;
}

/** Rotate interval (ms) for UI components that want to cycle messages. */
export const AI_LOADING_ROTATE_MS = 2500;
