import { NextResponse } from "next/server";

const EMOJI_RULES: { keywords: string[]; emojis: string[]; gradient?: string }[] = [
  { keywords: ["cookie", "cake", "pizza", "ice cream", "candy", "chocolate", "food", "eat", "hungry", "dinner", "lunch", "breakfast", "snack", "yummy", "delicious", "cheese", "chicken", "fries", "burger", "spaghetti", "noodle", "fruit", "apple", "banana"], emojis: ["🍪", "🍕", "🍦", "🍰", "🍫", "🧁"], gradient: "from-amber-100 to-orange-100" },
  { keywords: ["dog", "cat", "puppy", "kitty", "bunny", "rabbit", "fish", "bird", "horse", "pony", "lion", "tiger", "bear", "animal", "zoo", "dinosaur", "dino", "bug", "butterfly", "elephant", "monkey", "duck", "cow", "pig"], emojis: ["🐶", "🐱", "🦁", "🐻", "🦋", "🐸", "🦖"], gradient: "from-green-100 to-emerald-100" },
  { keywords: ["funny", "silly", "laugh", "haha", "lol", "poop", "butt", "fart", "pee", "booger", "stinky", "weird", "crazy", "goofy", "joke", "hilarious"], emojis: ["😂", "🤪", "😜", "💀", "🤣"], gradient: "from-yellow-100 to-amber-100" },
  { keywords: ["love", "sweet", "hug", "kiss", "heart", "mommy", "daddy", "mama", "papa", "cuddle", "miss you", "best", "pretty", "beautiful", "princess", "prince", "marry"], emojis: ["💕", "🥰", "❤️", "😍", "💗"], gradient: "from-pink-100 to-rose-100" },
  { keywords: ["why", "how", "what", "where", "when", "wonder", "think", "know", "question", "curious", "really", "true"], emojis: ["🤔", "❓", "💭", "🧐"], gradient: "from-blue-100 to-indigo-100" },
  { keywords: ["sleep", "tired", "nap", "bed", "dream", "night", "moon", "star"], emojis: ["😴", "🌙", "⭐", "💤"], gradient: "from-indigo-100 to-purple-100" },
  { keywords: ["school", "learn", "read", "book", "write", "teacher", "abc", "count", "number", "math"], emojis: ["📚", "✏️", "🎒", "🧠"], gradient: "from-sky-100 to-blue-100" },
  { keywords: ["play", "game", "fun", "toy", "ball", "run", "jump", "swing", "slide", "park"], emojis: ["🎮", "⚽", "🎪", "🎈"], gradient: "from-violet-100 to-purple-100" },
  { keywords: ["rain", "sun", "snow", "cold", "hot", "wind", "cloud", "weather", "rainbow"], emojis: ["🌈", "☀️", "❄️", "🌧️"], gradient: "from-cyan-100 to-sky-100" },
  { keywords: ["super", "hero", "power", "strong", "brave", "fight", "sword", "magic", "wizard", "dragon"], emojis: ["🦸", "⚡", "🗡️", "🐉"], gradient: "from-red-100 to-orange-100" },
  { keywords: ["music", "sing", "song", "dance", "piano", "guitar"], emojis: ["🎵", "🎶", "💃", "🎤"], gradient: "from-fuchsia-100 to-pink-100" },
  { keywords: ["car", "truck", "plane", "train", "boat", "drive", "ride", "fly", "space", "rocket"], emojis: ["🚗", "✈️", "🚀", "🚂"], gradient: "from-slate-100 to-zinc-100" },
];

function getAutoEmoji(text: string): { emoji: string; bg_gradient: string | null } {
  const lower = text.toLowerCase();

  for (const rule of EMOJI_RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      const emoji = rule.emojis[Math.floor(Math.random() * rule.emojis.length)];
      return { emoji, bg_gradient: rule.gradient ?? null };
    }
  }

  return { emoji: "✨", bg_gradient: null };
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }
    const result = getAutoEmoji(text);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
