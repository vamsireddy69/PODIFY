import type { Podcast, Comment } from "./types";

const sampleAudio = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

export const CATEGORIES = [
  { id: "indian-creators", name: "Indian Creators", color: "from-orange-500 to-rose-500", icon: "🇮🇳" },
  { id: "startup", name: "Startup", color: "from-blue-500 to-cyan-500", icon: "🚀" },
  { id: "global", name: "Global", color: "from-violet-500 to-fuchsia-500", icon: "🌍" },
  { id: "business", name: "Business", color: "from-emerald-500 to-teal-500", icon: "📈" },
  { id: "self-growth", name: "Self Growth", color: "from-amber-500 to-orange-500", icon: "🧠" },
  { id: "ai-tech", name: "AI / Tech", color: "from-fuchsia-500 to-purple-600", icon: "🤖" },
  { id: "career", name: "Career & Code", color: "from-indigo-500 to-blue-500", icon: "🎓" },
  { id: "creator", name: "Creator Economy", color: "from-rose-500 to-pink-500", icon: "🎥" },
  { id: "talks", name: "Big Talks", color: "from-sky-500 to-indigo-500", icon: "🎤" },
  { id: "finance", name: "Money", color: "from-yellow-500 to-amber-500", icon: "💰" },
];

type Seed = {
  title: string;
  creator: string;
  channel: string;       // youtube handle (without @)
  videoId: string;       // a real, well-known video id from that creator
  category: string;
  language: string;
  tags: string[];
  duration: number;      // seconds
  description: string;
};

// Curated representative videos per channel. Using known long-form / popular uploads.
const SEEDS: Seed[] = [
  // ---- Indian creators / podcasts ----
  { title: "Money, Mindset & Entrepreneurship", creator: "Ankur Warikoo", channel: "warikoo", videoId: "_NLRYgWh2IE", category: "Indian Creators", language: "Hindi", tags: ["Mindset", "Money"], duration: 3600, description: "Ankur Warikoo on building a life of freedom — money, careers, startups and the mindset shifts that matter." },
  { title: "How to Stop Wasting Your Life", creator: "Ankur Warikoo", channel: "warikoo", videoId: "uVVri3khsco", category: "Indian Creators", language: "Hindi", tags: ["Productivity", "Discipline"], duration: 4200, description: "A long-form deep dive on regret, productivity and crafting a life you don't want to escape from." },
  { title: "Varun Mayya on AI, Startups & The Future", creator: "Varun Mayya", channel: "VarunMayya", videoId: "NLclBsCI5DQ", category: "AI / Tech", language: "English", tags: ["AI", "Startup"], duration: 3300, description: "Varun Mayya unpacks the AI wave, founder mistakes and where India fits in the new tech order." },
  { title: "The Figuring Out Show — Full Episode", creator: "Raj Shamani", channel: "rajshamani", videoId: "DxREm3s1scA", category: "Indian Creators", language: "Hindi", tags: ["Interview", "Business"], duration: 4500, description: "Raj Shamani's flagship Figuring Out podcast — candid conversations with India's biggest founders and minds." },
  { title: "BeerBiceps Podcast — Mindset & Mastery", creator: "Ranveer Allahbadia", channel: "BeerBiceps", videoId: "wGGEY-tjQMc", category: "Indian Creators", language: "English", tags: ["Mindset", "Interview"], duration: 4800, description: "Ranveer Allahbadia explores spirituality, fitness and high performance with India's top guests." },
  { title: "Personal Finance, Decoded", creator: "Sharan Hegde", channel: "SharanHegde", videoId: "Z8ahDvSUHuI", category: "Money", language: "English", tags: ["Finance", "Money"], duration: 1800, description: "Sharan Hegde — Finance With Sharan — breaks down money the way Gen-Z actually wants to learn it." },
  { title: "Prakhar Ke Pravachan", creator: "Prakhar Gupta", channel: "PrakharGupta", videoId: "YxDZQXGZb-Y", category: "Self Growth", language: "Hindi", tags: ["Storytelling", "Wisdom"], duration: 3000, description: "Prakhar Gupta's reflective talks on life, work and meaning." },
  { title: "WTF is with Nikhil Kamath", creator: "Nikhil Kamath", channel: "nikhilkamathcio", videoId: "7TavJ3iJJlo", category: "Startup", language: "English", tags: ["Founders", "Investing"], duration: 5400, description: "Zerodha co-founder Nikhil Kamath hosts unfiltered conversations with India's top entrepreneurs." },
  { title: "Honestly by Tanmay Bhat", creator: "Tanmay Bhat", channel: "TanmayBhat", videoId: "JvBT4XBdoUE", category: "Indian Creators", language: "Hindi", tags: ["Comedy", "Interview"], duration: 3600, description: "Tanmay Bhat in long-form mode — comedy, candid takes and surprisingly deep conversations." },
  { title: "Dhruv Rathee Podcast — Big Ideas", creator: "Dhruv Rathee", channel: "DhruvRathee", videoId: "T_PuzBKqWGs", category: "Indian Creators", language: "Hindi", tags: ["Politics", "Education"], duration: 1800, description: "Dhruv Rathee unpacks complex world events and big ideas with research-backed clarity." },
  { title: "Josh Talks — Stories That Move India", creator: "Josh Talks", channel: "JoshTalks", videoId: "ZXsQAXx_ao0", category: "Indian Creators", language: "Hindi", tags: ["Storytelling", "Inspiration"], duration: 1200, description: "Josh Talks — real stories from real Indians who chose to do the hard thing." },

  // ---- Indian Startup ----
  { title: "The BarberShop with Shantanu", creator: "Shantanu Deshpande", channel: "ShantanuDeshpande", videoId: "u3xzpQT2Bck", category: "Startup", language: "English", tags: ["D2C", "Founders"], duration: 4200, description: "Bombay Shaving Co. founder Shantanu Deshpande on building D2C brands in India." },
  { title: "The Neon Show — Founders Unfiltered", creator: "Siddhartha Ahluwalia", channel: "TheNeonShow", videoId: "rzuCnJ3lYCg", category: "Startup", language: "English", tags: ["VC", "Founders"], duration: 4800, description: "The Neon Show — long-form conversations with India's most interesting founders and operators." },
  { title: "Founder Thesis", creator: "Founder Thesis", channel: "FounderThesis", videoId: "kFDLFhLs_Zw", category: "Startup", language: "English", tags: ["Founders", "Strategy"], duration: 3900, description: "Deep founder-led origin stories from India's startup ecosystem." },
  { title: "GrowthX Podcast", creator: "GrowthX", channel: "GrowthX_Club", videoId: "C2g9hO4-T_0", category: "Startup", language: "English", tags: ["Growth", "Product"], duration: 3300, description: "Operators and PMs share growth playbooks from India's fastest-scaling startups." },
  { title: "Indian Silicon Valley", creator: "Jivraj Singh Sachar", channel: "IndianSiliconValleyPodcast", videoId: "jRl3Rfg1Iv4", category: "Startup", language: "English", tags: ["Founders", "Tech"], duration: 3600, description: "Stories of Indian founders building world-class technology companies." },
  { title: "Think School — Business Cases", creator: "Think School", channel: "ThinkSchool", videoId: "TZpqDnQjLZw", category: "Business", language: "English", tags: ["Strategy", "Cases"], duration: 1200, description: "MBA-style breakdowns of the world's smartest business strategies." },

  // ---- Global Top Tier ----
  { title: "The Diary of a CEO — Steven Bartlett", creator: "Steven Bartlett", channel: "TheDiaryOfACEO", videoId: "Z7BcxCrxjVs", category: "Global", language: "English", tags: ["Interview", "Business"], duration: 5400, description: "Steven Bartlett's deep, vulnerable conversations with the people shaping our world." },
  { title: "Lex Fridman Podcast", creator: "Lex Fridman", channel: "lexfridman", videoId: "qCbfTN-caFI", category: "AI / Tech", language: "English", tags: ["AI", "Science"], duration: 9000, description: "Long-form conversations on AI, science, philosophy and the human condition." },
  { title: "My First Million", creator: "Sam Parr & Shaan Puri", channel: "MyFirstMillionPod", videoId: "Hu4Yvq-g7_Y", category: "Business", language: "English", tags: ["Business", "Ideas"], duration: 4200, description: "Brainstorming the next big business idea — every week." },
  { title: "The Tim Ferriss Show", creator: "Tim Ferriss", channel: "timferriss", videoId: "9NMTPVFedYE", category: "Self Growth", language: "English", tags: ["Performance", "Interview"], duration: 7200, description: "Deconstructing world-class performers to extract their tools, tactics and routines." },
  { title: "The School of Greatness", creator: "Lewis Howes", channel: "lewishowes", videoId: "HyGnqOVOZFw", category: "Self Growth", language: "English", tags: ["Mindset", "Interview"], duration: 5400, description: "Lewis Howes interviews world-class minds on greatness and impact." },
  { title: "Modern Wisdom", creator: "Chris Williamson", channel: "ChrisWillx", videoId: "0Su1Lz4XBxA", category: "Self Growth", language: "English", tags: ["Wisdom", "Interview"], duration: 4500, description: "Chris Williamson's curious conversations with the world's most thoughtful guests." },
  { title: "Deep Dive with Ali Abdaal", creator: "Ali Abdaal", channel: "AliAbdaal", videoId: "iONDebHX9qk", category: "Self Growth", language: "English", tags: ["Productivity", "Creator"], duration: 4200, description: "Long-form chats on productivity, creativity and building a life you love." },
  { title: "Huberman Lab", creator: "Andrew Huberman", channel: "hubermanlab", videoId: "SwQhKFMxmDY", category: "Self Growth", language: "English", tags: ["Science", "Health"], duration: 8000, description: "Stanford neuroscientist Andrew Huberman on science-based tools for everyday life." },
  { title: "Impact Theory", creator: "Tom Bilyeu", channel: "TomBilyeu", videoId: "hTSHXXcLBNs", category: "Self Growth", language: "English", tags: ["Mindset", "Business"], duration: 4800, description: "Tom Bilyeu interviews the world's most successful people to extract their mindset." },
  { title: "Colin and Samir", creator: "Colin & Samir", channel: "ColinandSamir", videoId: "sg1tT9rR1ZU", category: "Creator Economy", language: "English", tags: ["YouTube", "Creator"], duration: 3300, description: "The creator economy decoded — interviews with the world's biggest YouTubers." },

  // ---- Business / Money ----
  { title: "Alex Hormozi — How to Get Rich", creator: "Alex Hormozi", channel: "AlexHormozi", videoId: "Xqzy6lZojQI", category: "Business", language: "English", tags: ["Sales", "Business"], duration: 3600, description: "$100M+ founder Alex Hormozi shares the playbook for building wealth." },
  { title: "Graham Stephan — Real Money Talks", creator: "Graham Stephan", channel: "GrahamStephan", videoId: "1eulJW7T4hU", category: "Money", language: "English", tags: ["Finance", "Investing"], duration: 1800, description: "Graham Stephan on real estate, investing and growing wealth." },
  { title: "Mark Tilbury — Money Lessons", creator: "Mark Tilbury", channel: "MarkTilbury", videoId: "7lE0lY9_YzM", category: "Money", language: "English", tags: ["Finance", "Wealth"], duration: 900, description: "Self-made millionaire Mark Tilbury teaches what schools never did." },
  { title: "The Ramsey Show", creator: "Dave Ramsey", channel: "TheRamseyShow", videoId: "kJ81EJnGFKE", category: "Money", language: "English", tags: ["Debt", "Finance"], duration: 3600, description: "Dave Ramsey takes calls and changes lives, one budget at a time." },
  { title: "Earn Your Leisure", creator: "EYL", channel: "EarnYourLeisure", videoId: "uIsZkNbR9zk", category: "Business", language: "English", tags: ["Business", "Wealth"], duration: 5400, description: "Rashad Bilal & Troy Millings on financial literacy and entrepreneurship." },

  // ---- Self-improvement ----
  { title: "Jay Shetty — On Purpose", creator: "Jay Shetty", channel: "JayShettyPodcast", videoId: "rBzqyutpSEQ", category: "Self Growth", language: "English", tags: ["Mindset", "Wellness"], duration: 4200, description: "Former monk Jay Shetty on living with purpose, peace and meaning." },
  { title: "Matt D'Avella — Minimalism", creator: "Matt D'Avella", channel: "MattDAvella", videoId: "7xuYAfSr8YQ", category: "Self Growth", language: "English", tags: ["Minimalism", "Habits"], duration: 1200, description: "Filmmaker Matt D'Avella on minimalism, habits and slow living." },

  // ---- Career / Tech ----
  { title: "Ishan Sharma — Build in Public", creator: "Ishan Sharma", channel: "IshanSharma7390", videoId: "LeHPMmWZIOk", category: "Career & Code", language: "Hindi", tags: ["Career", "Student"], duration: 1800, description: "Ishan Sharma on student entrepreneurship, building in public and India's youth." },
  { title: "Aman Dhattarwal — Study Real", creator: "Aman Dhattarwal", channel: "AmanDhattarwal", videoId: "2qd9QhdLKCY", category: "Career & Code", language: "Hindi", tags: ["Student", "Productivity"], duration: 1500, description: "Aman Dhattarwal — honest takes on student life, JEE and growing up." },
  { title: "CodeWithHarry Talks", creator: "Harry", channel: "CodeWithHarry", videoId: "ER9SspLe4Hg", category: "Career & Code", language: "Hindi", tags: ["Code", "Career"], duration: 2400, description: "Harry from CodeWithHarry on becoming a developer in India." },
  { title: "Hitesh Choudhary — Dev Real Talk", creator: "Hitesh Choudhary", channel: "HiteshCodeLab", videoId: "p9tfJEwJBFw", category: "Career & Code", language: "Hindi", tags: ["Code", "Career"], duration: 2700, description: "Hitesh Choudhary on the real dev life — beyond tutorials." },
  { title: "Striver — DSA Mastery", creator: "Raj Vikramaditya", channel: "takeUforward", videoId: "0bHoB32fuj0", category: "Career & Code", language: "Hindi", tags: ["DSA", "Code"], duration: 3600, description: "Striver shares the mindset behind cracking top-tier engineering interviews." },

  // ---- AI ----
  { title: "Dwarkesh Podcast — AI Frontier", creator: "Dwarkesh Patel", channel: "DwarkeshPatel", videoId: "Gg-w_n9NJIE", category: "AI / Tech", language: "English", tags: ["AI", "Research"], duration: 5400, description: "Dwarkesh Patel interviews the people building the AI future." },
  { title: "Machine Learning Street Talk", creator: "MLST", channel: "MachineLearningStreetTalk", videoId: "MG9oqntiJKg", category: "AI / Tech", language: "English", tags: ["ML", "Research"], duration: 6000, description: "Deep technical discussions on the state of machine learning research." },
  { title: "Two Minute Papers", creator: "Károly Zsolnai-Fehér", channel: "TwoMinutePapers", videoId: "rhO40-J0fSE", category: "AI / Tech", language: "English", tags: ["AI", "Research"], duration: 480, description: "Bite-sized but mind-blowing summaries of cutting-edge AI research." },
  { title: "Yannic Kilcher — Paper Reviews", creator: "Yannic Kilcher", channel: "YannicKilcher", videoId: "kCc8FmEb1nY", category: "AI / Tech", language: "English", tags: ["AI", "Papers"], duration: 3000, description: "Yannic Kilcher walks through the latest AI papers in plain English." },
  { title: "DeepLearningAI — Andrew Ng", creator: "DeepLearning.AI", channel: "Deeplearningai", videoId: "vStJoetOxJg", category: "AI / Tech", language: "English", tags: ["AI", "Education"], duration: 2700, description: "Andrew Ng and the DeepLearning.AI team on how to actually learn AI today." },

  // ---- Storytelling / Talks ----
  { title: "Dostcast — Long Conversations", creator: "Vinamre Kasanaa", channel: "Dostcast", videoId: "nN0cF6yBz5w", category: "Indian Creators", language: "Hindi", tags: ["Interview", "Storytelling"], duration: 5400, description: "Dostcast — raw, unfiltered conversations that go where others won't." },
  { title: "Unfiltered by Samdish", creator: "Samdish", channel: "Samdish", videoId: "8QvJ_z8DwKo", category: "Indian Creators", language: "Hindi", tags: ["Interview", "Politics"], duration: 2400, description: "Samdish Bhatia in conversation with India's most powerful — unfiltered." },
  { title: "Humans of Bombay", creator: "Karishma Mehta", channel: "humansofbombay", videoId: "8TX0RfJqYBw", category: "Indian Creators", language: "English", tags: ["Stories", "People"], duration: 1500, description: "Real stories from real Bombayites — joy, heartbreak and everything between." },

  // ---- Creator economy ----
  { title: "Think Media", creator: "Sean Cannell", channel: "ThinkMediaTV", videoId: "K8Yp1XIH1WE", category: "Creator Economy", language: "English", tags: ["YouTube", "Creator"], duration: 1800, description: "Sean Cannell on growing on YouTube — gear, strategy, mindset." },
  { title: "vidIQ — Growth Tactics", creator: "vidIQ", channel: "vidIQ", videoId: "5hLgWY9ttYc", category: "Creator Economy", language: "English", tags: ["YouTube", "SEO"], duration: 1200, description: "Inside the YouTube algorithm — what's actually working right now." },
  { title: "Creator Science", creator: "Jay Clouse", channel: "CreatorScience", videoId: "u8C9V6FZKx4", category: "Creator Economy", language: "English", tags: ["Creator", "Business"], duration: 2400, description: "Jay Clouse breaks down how full-time creators actually build their businesses." },

  // ---- Big Talks ----
  { title: "Y Combinator — Startup School", creator: "Y Combinator", channel: "ycombinator", videoId: "CBYhVcO4WgI", category: "Startup", language: "English", tags: ["YC", "Founders"], duration: 3600, description: "How to build a great startup — straight from YC partners." },
  { title: "a16z Podcast", creator: "Andreessen Horowitz", channel: "a16z", videoId: "qAOWZSjs9Rw", category: "AI / Tech", language: "English", tags: ["VC", "Tech"], duration: 3000, description: "a16z on the technologies and trends shaping the future." },
  { title: "Talks at Google", creator: "Google", channel: "TalksAtGoogle", videoId: "qsCNNPBIB7k", category: "Big Talks", language: "English", tags: ["Talks", "Ideas"], duration: 3600, description: "World-class minds in conversation, hosted by Google." },
  { title: "TED — Ideas Worth Spreading", creator: "TED", channel: "TED", videoId: "8jPQjjsBbIc", category: "Big Talks", language: "English", tags: ["Talks", "Ideas"], duration: 1080, description: "Ideas worth spreading — the iconic TED stage." },
  { title: "Big Think", creator: "Big Think", channel: "bigthink", videoId: "6dbmd-tGvUE", category: "Big Talks", language: "English", tags: ["Ideas", "Science"], duration: 600, description: "The world's leading thinkers on the ideas shaping our future." },
  { title: "London Real", creator: "Brian Rose", channel: "LondonRealTV", videoId: "LDNkYE0eyKk", category: "Big Talks", language: "English", tags: ["Interview", "Mindset"], duration: 4500, description: "Brian Rose's long-form interviews with people who do the impossible." },

  // ---- Hidden gems ----
  { title: "ColdFusion — How It Happened", creator: "Dagogo Altraide", channel: "ColdFusion", videoId: "4V3yu8X6efY", category: "AI / Tech", language: "English", tags: ["Tech", "Story"], duration: 1500, description: "ColdFusion — the cinematic origin stories of the world's biggest tech." },
  { title: "Johnny Harris — How the World Works", creator: "Johnny Harris", channel: "johnnyharris", videoId: "tFSuKBHX_Mw", category: "Big Talks", language: "English", tags: ["Geopolitics", "Story"], duration: 1500, description: "Johnny Harris explains how the world really works — visually." },
  { title: "MagnatesMedia — Founder Stories", creator: "MagnatesMedia", channel: "MagnatesMedia", videoId: "rnFoSRxMhGc", category: "Business", language: "English", tags: ["Founders", "Story"], duration: 1500, description: "Cinematic deep dives into the founders who built modern empires." },
  { title: "Fireship — Tech in 100 Seconds", creator: "Fireship", channel: "Fireship", videoId: "p3lsYlod5OU", category: "AI / Tech", language: "English", tags: ["Code", "Tech"], duration: 480, description: "The fastest, funniest tech explainers on YouTube." },
];

// Build full Podcast catalog from seeds.
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const PODCASTS: Podcast[] = SEEDS.map((s, i) => {
  const creatorId = slug(s.creator);
  return {
    id: `pod-${i + 1}-${slug(s.title).slice(0, 24)}`,
    title: s.title,
    creator: s.creator,
    creatorId,
    category: s.category,
    tags: s.tags,
    language: s.language,
    cover: `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg`,
    duration: s.duration,
    plays: 25_000 + ((i * 9173) % 1_400_000),
    rating: 4.3 + ((i * 7) % 7) / 10,
    description: s.description,
    audioUrl: sampleAudio,
    youtubeId: s.videoId,
    youtubeChannel: s.channel,
    publishedAt: (() => {
      const now = Date.now();
      if (i % 5 === 0) {
        // Within 1 day (e.g. 5 hours ago, 12 hours ago, 23 hours ago)
        const hours = 1 + (i % 23);
        return new Date(now - hours * 3600 * 1000).toISOString();
      } else if (i % 5 === 1) {
        // Within a month (e.g. 3 days ago, 15 days ago, etc.)
        const days = 1 + (i % 28);
        return new Date(now - days * 24 * 3600 * 1000).toISOString();
      } else if (i % 5 === 2) {
        // Within a year (e.g. 2 months ago, 8 months ago, etc.)
        const months = 1 + (i % 11);
        return new Date(now - months * 30 * 24 * 3600 * 1000).toISOString();
      } else {
        // Years ago (e.g. 1 year ago, 3 years ago, 5 years ago)
        const years = 1 + (i % 5);
        return new Date(now - years * 365 * 24 * 3600 * 1000).toISOString();
      }
    })(),
  };
});

// Unique creators derived from the seeds.
const seenCreators = new Map<string, { id: string; name: string; channel: string; cover: string }>();
SEEDS.forEach((s) => {
  const id = slug(s.creator);
  if (!seenCreators.has(id)) {
    seenCreators.set(id, { id, name: s.creator, channel: s.channel, cover: `https://i.ytimg.com/vi/${s.videoId}/hqdefault.jpg` });
  }
});

export const CREATORS = Array.from(seenCreators.values()).map((c, i) => ({
  id: c.id,
  name: c.name,
  avatar: c.cover,
  youtubeChannel: c.channel,
  followers: 50_000 + ((i * 31337) % 5_000_000),
  bio: `Long-form conversations & ideas from ${c.name}. Tap follow to never miss a drop.`,
}));

// Curated rails
const byCategory = (cat: string) => PODCASTS.filter((p) => p.category === cat);
export const TRENDING = [
  ...byCategory("Indian Creators").slice(0, 4),
  ...byCategory("Global").slice(0, 2),
  ...byCategory("AI / Tech").slice(0, 2),
].slice(0, 8);

export const RECOMMENDED = [
  ...byCategory("Self Growth").slice(0, 3),
  ...byCategory("Business").slice(0, 2),
  ...byCategory("Money").slice(0, 2),
  ...byCategory("Career & Code").slice(0, 1),
].slice(0, 8);

export const RECENT = PODCASTS.slice(2, 10);

export const MOCK_COMMENTS: Comment[] = [
  { id: "c1", user: "Riya S.", avatar: "https://i.pravatar.cc/100?img=5", text: "This episode hit different — bookmarking the whole series.", time: "2h ago" },
  { id: "c2", user: "Marcus K.", avatar: "https://i.pravatar.cc/100?img=8", text: "Played this on a walk. The audio-only mode on Podify is a killer feature.", time: "5h ago" },
  { id: "c3", user: "Anika P.", avatar: "https://i.pravatar.cc/100?img=20", text: "Love that I can switch between video and audio without leaving the app.", time: "1d ago" },
];

export function formatDuration(s: number) {
  if (!Number.isFinite(s) || s <= 0) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function formatPlays(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
}

export function youtubeChannelUrl(handle: string) {
  return `https://www.youtube.com/@${handle}`;
}
