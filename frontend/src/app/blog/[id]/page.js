'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';

const posts = [
  {
    id: '1',
    title: 'The Power of Pen and Paper in the Digital Age',
    date: 'October 10, 2025',
    author: 'Admin',
    image: '/post1.jpeg',
    content: `Writing with pen and paper activates cognitive processes that typing alone often cannot match.

Memory & comprehension:
Research shows handwriting engages different neural pathways compared to typing. Forming letters by hand slows information processing just enough to deepen understanding and improve retention. Students who take handwritten notes often remember concepts better because the act requires summarizing and rephrasing, not merely transcribing.

Creativity & idea generation:
The tactile nature of pen-on-paper supports nonlinear thinking. Sketching arrows, doodling diagrams, and writing free-form notes encourages associative leaps that a linear typed document rarely does. Many writers and designers keep a "brain dump" page in their notebook precisely because it allows messy, creative exploration.

Mindfulness & focus:
Handwriting reduces digital distractions — no notifications, no tempting browser tabs. The deliberate act of writing can become a short mindfulness ritual, clearing mental clutter and enabling deeper concentration.

Practical tips for using a notebook:
• Keep a running ideas page for half-formed thoughts.  
• Date entries for traceability and to build momentum over time.  
• Use a simple index at the front so you can find key pages later.  
• Combine short sketches with bullets — visuals aid recall.

Conclusion:
Pen + paper is not a replacement for digital tools but a powerful complement. Capture and brainstorm on paper, then refine digitally. Using both wisely gives you the speed of digital and the depth of handwriting.`,
  },

  {
    id: '2',
    title: 'Top 10 Stationery Essentials Every Student and Professional Should Own',
    date: 'September 24, 2025',
    author: 'Admin',
    image: '/post2.jpeg',
    content: `A curated stationery kit is more than pretty tools — it supports habits that increase productivity and joy.

1) A durable notebook:
Choose a binding that fits your workflow (thread-sewn for permanence, spiral for lay-flat convenience). Prefer paper in the 80–100 GSM range to avoid ink bleed-through.

2) Reliable pens:
Keep at least two types: a smooth gel pen for daily notes and a ballpoint for long writing sessions. Consider a fine-liner for diagramming and annotations.

3) Planner or calendar:
A weekly visual planner helps with time-blocking and large deadlines. Combine with a digital calendar for reminders.

4) Highlighters and markers:
Color-coding speeds revision and makes important information pop. Use a consistent color system (e.g., yellow = facts, pink = follow-ups).

5) Sticky notes:
Perfect for temporary reminders, quick bookmarks, and layering ideas without committing them to the main notebook.

6) Tabs and index stickers:
Divide a notebook into sections for projects, meeting notes, and ideas — makes lookup fast.

7) Clips and a small folder:
Keep loose handouts and receipts organized, especially when moving between classes or meetings.

8) Pocket sketchbook:
Useful for quick diagrams, mind maps, and visual thinking.

9) Ruler and eraser:
Small tools that keep notes tidy and readable — underrated but practical.

10) Desk organizer or pen case:
Protects your tools, reduces clutter, and makes your desk inviting.

Buying and maintenance tips:
Invest in quality where it matters (notebooks and pens). Refill what you can to reduce waste. Rotate supplies occasionally to keep novelty and motivation alive.

Final thought:
The best stationery is what you actually use. Start with essentials, then add items that meaningfully improve your workflow.`,
  },

  {
    id: '3',
    title: "How to Stay Organized: Notebook Hacks You’ll Actually Use",
    date: 'September 12, 2025',
    author: 'Admin',
    image: '/post3.png',
    content: `Simple notebook systems produce big results — and they don't have to be complicated.

Create an index:
Reserve the first few pages as an index and number every page. Add short labels as you go — this turns your notebook into a searchable handbook.

Weekly + daily structure:
Maintain a weekly overview for appointments and top priorities. Use daily entries for focused tasks — list 3 top tasks each day and a short area for notes or follow-ups.

Use rapid logging:
Adopt tiny symbols to classify entries quickly: • task, ◦ note, ✱ important. This makes scanning and migrating tasks effortless.

Habit trackers:
A small grid for recurring habits (reading, exercise, studying) gives a visual streak that motivates consistent behavior.

Project pages:
Create a dedicated page for each project with milestones, next actions, and a brief “why” — it keeps the project anchored and prevents task drift.

Cornell-style notes for study:
Divide a page into main notes, keywords/questions, and a summary area. This layout makes review efficient and active.

Review weekly:
Set a 10–15 minute weekly review to migrate incomplete tasks, archive finished pages, and plan the week ahead.

Personalize:
Start with these templates, then tweak them. The system should support your life, not constrain it.

Final thought:
Consistency beats complexity. A small set of reliable notebook habits will outperform a complicated system you never maintain.`,
  },
];

export default function BlogDetailsPage() {
  const { id } = useParams();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-[#0a0f1c]">
        <h1 className="text-2xl">404 | Blog not found</h1>
      </div>
    );
  }

  // Convert content paragraphs into <p> blocks
  const paragraphs = post.content.split('\n\n').map((p, idx) => p.trim());

  // Related posts (exclude current)
  const related = posts.filter((p) => p.id !== post.id);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-100 py-12 relative">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/blog" className="text-blue-400 hover:underline mb-6 inline-block">
          ← Back to Blog
        </Link>

        <article className="bg-[#121826] rounded-2xl overflow-hidden shadow-lg border border-gray-800">
          <div className="w-full overflow-hidden rounded-t-2xl">
            <img
              src={post.image}
              alt={post.title}
              className="w-full max-h-[420px] object-cover object-center"
            />
          </div>

          <div className="p-10">
            <div className="flex items-center text-sm text-blue-400 space-x-6 mb-6">
              <div className="flex items-center">
                <FiCalendar className="mr-2" />
                <span>{post.date}</span>
              </div>
              <div className="flex items-center">
                <FiUser className="mr-2" />
                <span>by {post.author}</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-6 text-white leading-tight">{post.title}</h1>

            <div className="prose prose-invert max-w-none text-gray-300 space-y-6">
              {paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
        </article>

        {/* Related posts */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
          {related.map((r) => (
            <Link
              key={r.id}
              href={`/blog/${r.id}`}
              className="flex items-center gap-4 bg-[#0f1724] rounded-xl p-4 border border-gray-800 hover:shadow-lg transition"
            >
              <img src={r.image} alt={r.title} className="w-24 h-16 object-cover rounded-md" />
              <div>
                <div className="text-sm text-blue-400">By {r.author}</div>
                <div className="font-semibold text-white">{r.title}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Floating Reach Us link */}
      <div className="fixed right-4 top-1/2 -translate-y-1/2 z-50">
        <Link
          href="/contact-us"
          className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-l-md font-semibold shadow-lg rotate-90 origin-right tracking-wide"
        >
          REACH&nbsp;US
        </Link>
      </div>
    </div>
  );
}
