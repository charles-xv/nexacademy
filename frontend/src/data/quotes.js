// Learning-focused encouragement shown under the dashboard greeting.
// One is picked per day (not per refresh) so it feels intentional,
// not twitchy. Add as many as you like — the rotation handles the rest.
export const learningQuotes = [
  'Consistency feels small until the results show up.',
  'A little progress each day adds up to big results.',
  'The expert in anything was once a beginner.',
  "Don't watch the clock; do what it does — keep going.",
  'Small steps every day beat big steps once in a while.',
  'Learning never exhausts the mind — it fuels it.',
  'Your only limit is the effort you decide to give.',
  'Skill grows in the hours nobody claps for.',
  'Show up today; your future self is watching.',
  'Every pro was once an amateur who refused to quit.',
];

// Same quote for the whole day, changes tomorrow.
export function getDailyQuote() {
  const dayNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return learningQuotes[dayNumber % learningQuotes.length];
}