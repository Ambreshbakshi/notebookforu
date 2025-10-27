'use client';

import React from 'react';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
const posts = [
  {
    id: '1',
    title: 'The Power of Pen and Paper in the Digital Age',
    date: 'October 10, 2025',
    author: 'Admin',
    image: '/post1.jpeg',
    excerpt:
      'In an era ruled by screens, typing, and AI, the simple act of writing with a pen still holds incredible power...',
    content: `Writing with pen and paper unlocks cognitive benefits that typing alone often cannot match.

Paragraph 1 — Memory and comprehension:
Multiple studies show that handwriting engages different neural pathways than typing. When you physically form letters, your brain processes the information more deeply — improving memory retention and comprehension. Students who take handwritten notes commonly recall more than those who solely type.

Paragraph 2 — Creativity and idea generation:
The tactile nature of pen on paper makes brainstorming feel freer. Sketches, arrows, and quick margin notes aren’t just convenient — they enable associative thinking. Many creatives prefer notebooks because they allow non-linear thought: doodles become prompts, lists become storyboards.

Paragraph 3 — Mindfulness and focus:
Writing by hand slows you down in a good way. It reduces the impulse to multitask and minimizes digital distractions (notifications, browser tabs). A mindful notebook session can double as a short meditation — clearing your mind and making the ideas that remain clearer and more actionable.

Paragraph 4 — Practical tips for using your notebook:
1. Use a dedicated “idea” section — keep a running list of half-formed ideas.  
2. Date every entry — it helps track progress and revisit seeds of thought.  
3. Combine text with quick sketches — visual notes enhance recall.  
4. Carry a small pocket notebook for on-the-go thoughts.

Paragraph 5 — Final thought:
In short, pen + paper is not just nostalgic — it’s an effective complementary tool to your digital workflow. Use them together: sketch and capture by hand, then refine digitally when needed.`
  },

  {
    id: '2',
    title: 'Top 10 Stationery Essentials Every Student and Professional Should Own',
    date: 'September 24, 2025',
    author: 'Admin',
    image: '/post2.jpeg',
    excerpt:
      'Whether you’re a student or a pro, the right stationery can streamline workflow, boost focus, and make work more enjoyable...',
    content: `A well-curated stationery kit is more than aesthetics — it supports habits that increase productivity and joy.

Paragraph 1 — The essentials:
1. A sturdy notebook — choose thread-sewn binding or spiral based on preference. Prefer high-quality paper (80–100 GSM) to avoid bleed-through.  
2. A reliable pen (or two) — gel pens for smooth notes, a ballpoint for long writing sessions, and a fine liner for precise work.  
3. A planner or calendar — digital reminders are great, but a visual calendar on paper helps with weekly planning and big-picture time management.  
4. Highlighters & markers — useful for revising, color-coding subjects, and visually separating information.

Paragraph 2 — Organization helpers:
5. Sticky notes — quick reminders, bookmarks, and temporary labels.  
6. Tabs or index stickers — divide notebooks into sections for faster lookup.  
7. Clips & small folder — keep loose papers and receipts together when moving between classes or meetings.

Paragraph 3 — Creative extras:
8. A pocket-sized sketchbook — perfect for quick diagrams or brainstorming.  
9. A ruler & eraser — precision tools are underrated; they help maintain clean, readable notes.  
10. A pen case or desk organizer — protecting your tools keeps them usable and tidy.

Paragraph 4 — Buying tips & upkeep:
- Invest in a couple of high-quality pieces rather than many cheap ones.  
- Refill pens where possible to reduce waste and keep a consistent writing feel.  
- Clean your desk and rotate your supplies seasonally — swapping pens and notebooks preserves novelty and motivation.

Paragraph 5 — Final thought:
The best kit is the one you will actually use. Start with essentials, then add items that directly improve your workflow or bring joy. The right stationery becomes part of your productivity system, not just accessories.`
  },

  {
    id: '3',
    title: "How to Stay Organized: Notebook Hacks You’ll Actually Use",
    date: 'September 12, 2025',
    author: 'Admin',
    image: '/post3.png',
    excerpt:
      "Organization doesn't have to be complicated — start with a few reliable notebook systems that stick...",
    content: `Practical notebook systems are simple to implement and highly effective for organizing tasks, ideas, study notes, and projects.

Paragraph 1 — Setup a simple index:
Reserve the first 2–4 pages of your notebook as an "Index" (or table of contents). Number each page and add short labels to the index as you go. This makes retrieval fast and removes paper clutter.

Paragraph 2 — The daily/weekly structure:
Use a two-layer approach: a weekly overview and daily entries. The weekly overview is where you place top priorities and appointments. Daily entries are short: 3–5 tasks, quick notes, and any follow-ups for tomorrow.

Paragraph 3 — Rapid logging & symbols:
Adopt a small symbol system:  
- • Task  
- ◦ Note/idea  
- ✱ Priority  
- — Completed (or ✓)

Symbols let you skim and update quickly. You can also migrate uncompleted tasks to the next day — this small ritual boosts follow-through.

Paragraph 4 — Visual trackers & habit logs:
Use a habit tracker grid for recurring tasks (exercise, reading, study hours). Checkboxes are motivating and show progress visually. For long-term projects, add a simple timeline or milestone list in a dedicated project section.

Paragraph 5 — Notes that “work”:
For study or meeting notes, use three areas on the page: main notes, keywords/questions, and a short summary at the bottom. This Cornell-inspired layout helps with review and future retrieval.

Paragraph 6 — Final tips:
- Keep one “ideas” page per project so you don’t lose stray thoughts.  
- Review your notebook weekly; archive or transfer what you need.  
- Customize — these are templates, not rules. Tweak them until they fit your day.

Paragraph 7 — Final thought:
A notebook system becomes powerful when it is used consistently. Start simple, iterate, and make your notebook your trusted second brain.`
  }
];

export default function BlogPage() {
  const latest = posts;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN BLOG SECTION */}
        <main className="lg:col-span-2">
          {posts.map((post) => (
            <article
              key={post.id}
              className="bg-[#121826] rounded-2xl overflow-hidden shadow-lg border border-gray-800 mb-10"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-64 object-cover"
              />
              <div className="p-8">
                <div className="flex items-center text-sm text-blue-400 space-x-4 mb-4">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center">
                    <FiUser className="mr-2" />
                    <span>by {post.author}</span>
                  </div>
                </div>

                <h2 className="text-3xl font-bold mb-4 text-white">
                  {post.title}
                </h2>

                <p className="text-gray-300 mb-6">{post.excerpt}</p>

                <Link
                  href={`/blog/${post.id}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-all shadow-md"
                >
                  → READ MORE
                </Link>
              </div>
            </article>
          ))}
        </main>

        {/* SIDEBAR */}
        <aside className="space-y-6 sticky top-10">
          <div className="bg-[#121826] rounded-xl p-6 shadow-lg border border-gray-800">
            <h4 className="text-2xl font-bold mb-6 text-white">Latest Posts</h4>
            <div className="space-y-6">
              {latest.map((l) => (
                <div key={l.id} className="flex items-start space-x-4">
                  <img
                    src={l.image}
                    alt={l.title}
                    className="w-20 h-14 object-cover rounded"
                  />
                  <div>
                    <div className="text-sm text-blue-400 mb-1 flex items-center">
                      <FiUser className="mr-1" /> By {l.author}
                    </div>
                    <Link
                      href={`/blog/${l.id}`}
                      className="font-semibold text-gray-100 block leading-tight hover:text-blue-400"
                    >
                      {l.title}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Floating Reach Us button */}
         <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
  <Link
    href="/contact-us"
    className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-l-md font-semibold shadow-lg rotate-90 origin-right tracking-wide"
  >
    REACH&nbsp;US
  </Link>
</div>
        </aside>
      </div>
    </div>
  );
}
