'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

/**
 * Posts now use `contentBlocks` (array) instead of a single string.
 * This allows semantic rendering: headings, paragraphs, lists, blockquotes, callouts, etc.
 */
const posts = [
  {
    id: '1',
    title: 'The Power of Pen and Paper in the Digital Age',
    date: 'October 10, 2025',
    author: 'Admin',
    image: '/post1.jpeg',
    contentBlocks: [
      { type: 'lead', text: 'Writing with pen and paper activates cognitive processes that typing alone often cannot match.' },

      { type: 'h3', text: 'Memory & comprehension' },
      {
        type: 'p',
        text:
          'Research shows handwriting engages different neural pathways compared to typing. Forming letters by hand slows information processing just enough to deepen understanding and improve retention. Students who take handwritten notes often remember concepts better because the act requires summarizing and rephrasing, not merely transcribing.'
      },

      { type: 'h3', text: 'Creativity & idea generation' },
      {
        type: 'p',
        text:
          'The tactile nature of pen-on-paper supports nonlinear thinking. Sketching arrows, doodling diagrams, and writing free-form notes encourages associative leaps that a linear typed document rarely does. Many creatives keep a "brain dump" page in their notebook precisely because it allows messy, creative exploration.'
      },

      { type: 'blockquote', text: 'Pen + paper is not a replacement for digital tools — it is a powerful complement.' },

      { type: 'h3', text: 'Mindfulness & focus' },
      {
        type: 'p',
        text:
          'Handwriting reduces digital distractions — no notifications, no tempting browser tabs. The deliberate act of writing can become a short mindfulness ritual, clearing mental clutter and enabling deeper concentration.'
      },

      { type: 'h3', text: 'Practical tips for using a notebook' },
      {
        type: 'ul',
        items: [
          'Keep a running ideas page for half-formed thoughts.',
          'Date entries for traceability and to build momentum over time.',
          'Use a simple index at the front so you can find key pages later.',
          'Combine short sketches with bullets — visuals aid recall.'
        ]
      },

      { type: 'callout', text: 'Pro tip: Capture ideas on paper first, then refine them digitally for long-term storage.' },

      { type: 'h3', text: 'Conclusion' },
      {
        type: 'p',
        text:
          'Use pen and paper for capture and creativity, then use digital tools for revision and distribution. This hybrid workflow gives you the depth of handwriting and the speed of digital.'
      }
    ]
  },

  {
    id: '2',
    title: 'Top 10 Stationery Essentials Every Student and Professional Should Own',
    date: 'September 24, 2025',
    author: 'Admin',
    image: '/post2.jpeg',
    contentBlocks: [
      { type: 'lead', text: 'A curated stationery kit is more than pretty tools — it supports habits that increase productivity and joy.' },

      { type: 'h3', text: 'Top 10 essentials' },
      {
        type: 'ol',
        items: [
          'A durable notebook (thread-sewn or spiral depending on preference).',
          'A reliable pen kit — gel, ballpoint and a fine-liner.',
          'A weekly planner or visual calendar.',
          'Highlighters and markers for quick revision.',
          'Sticky notes for temporary reminders.',
          'Tabs and index stickers for fast lookup.',
          'Clips and a small folder for loose papers.',
          'Pocket sketchbook for diagrams and brainstorms.',
          'Ruler and eraser for tidy notes.',
          'A desk organizer or pen case.'
        ]
      },

      { type: 'h3', text: 'Buying & maintenance tips' },
      {
        type: 'p',
        text:
          'Invest in quality where it matters — notebooks and pens. Refill pens where possible to reduce waste, and rotate supplies occasionally to keep novelty and motivation alive.'
      },

      { type: 'callout', text: 'Tip: Start with 3–4 essentials and add only what solves a real problem for you.' }
    ]
  },

  {
    id: '3',
    title: "How to Stay Organized: Notebook Hacks You’ll Actually Use",
    date: 'September 12, 2025',
    author: 'Admin',
    image: '/post3.png',
    contentBlocks: [
      { type: 'lead', text: "Organization doesn't have to be complicated — start with a couple of reliable habits." },

      { type: 'h3', text: 'Create an index' },
      {
        type: 'p',
        text:
          'Reserve the first few pages as an index and number every page. Add short labels as you go — this transforms your notebook into a searchable resource.'
      },

      { type: 'h3', text: 'Weekly + daily structure' },
      {
        type: 'p',
        text:
          'Use a weekly overview for appointments and top priorities. Use short daily entries for 3 main tasks and a quick notes area for follow-ups.'
      },

      { type: 'h3', text: 'Rapid logging & symbols' },
      {
        type: 'ul',
        items: ['• Task', '◦ Note', '✱ Important', '✓ Completed']
      },

      { type: 'h3', text: 'Habit trackers & review' },
      {
        type: 'p',
        text:
          'Use a small habit grid to build streaks. Schedule a short weekly review to migrate unfinished tasks and archive completed pages.'
      },

      { type: 'callout', text: 'Small rituals — like a 5-minute nightly review — greatly improve consistency.' }
    ]
  }
];

/** Render a single content block */
function renderBlock(block, key) {
  switch (block.type) {
    case 'lead':
      return (
        <p key={key} className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-6">
          {block.text}
        </p>
      );

    case 'h2':
      return (
        <h2 key={key} className="text-2xl md:text-3xl font-semibold text-white mt-8 mb-4">
          {block.text}
        </h2>
      );

    case 'h3':
      return (
        <h3 key={key} className="text-lg md:text-xl font-semibold text-white mt-6 mb-3">
          {block.text}
        </h3>
      );

    case 'p':
      return (
        <p key={key} className="text-gray-300 leading-relaxed mb-4">
          {block.text}
        </p>
      );

    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-l-4 border-blue-600 pl-4 italic text-gray-200 bg-[#0f1724] p-4 rounded mb-6"
        >
          {block.text}
        </blockquote>
      );

    case 'ul':
      return (
        <ul key={key} className="list-disc list-inside text-gray-300 mb-6 space-y-2">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      );

    case 'ol':
      return (
        <ol key={key} className="list-decimal list-inside text-gray-300 mb-6 space-y-2">
          {block.items.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ol>
      );

    case 'callout':
      return (
        <div
          key={key}
          className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-md mb-6 shadow"
        >
          <strong className="block mb-1">Tip</strong>
          <div>{block.text}</div>
        </div>
      );

    default:
      return (
        <p key={key} className="text-gray-300 leading-relaxed mb-4">
          {block.text || ''}
        </p>
      );
  }
}

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

  // Build a small table-of-contents (headings from blocks)
  const toc = post.contentBlocks
    .filter((b) => b.type === 'h2' || b.type === 'h3')
    .map((b, i) => ({ text: b.text, id: `toc-${i}`, type: b.type }));

  const related = posts.filter((p) => p.id !== post.id);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-100 py-12 relative">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-8">
        {/* Main column */}
        <div>
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

              <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-white leading-tight">{post.title}</h1>

              {/* Article content rendered block-by-block */}
              <div className="prose prose-invert max-w-none text-gray-300">
                {post.contentBlocks.map((b, i) => (
                  <div key={i} id={b.type === 'h2' || b.type === 'h3' ? `block-${i}` : undefined}>
                    {renderBlock(b, i)}
                  </div>
                ))}
              </div>
            </div>
          </article>

          {/* Related posts */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold mb-4">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        </div>

        {/* Sticky right column: toc + meta */}
        <aside className="sticky top-28 self-start space-y-6">
          <div className="bg-[#121826] rounded-xl p-4 border border-gray-800">
            <div className="text-sm text-blue-400 mb-3">Article info</div>
            <div className="text-white font-semibold">{post.title}</div>
            <div className="text-sm text-gray-300 mt-2">
              <div className="flex items-center gap-2"><FiCalendar /> <span>{post.date}</span></div>
              <div className="flex items-center gap-2 mt-2"><FiUser /> <span>{post.author}</span></div>
            </div>
          </div>

          {toc.length > 0 && (
            <div className="bg-[#121826] rounded-xl p-4 border border-gray-800">
              <div className="text-sm text-blue-400 mb-3">Contents</div>
              <ul className="text-gray-200 space-y-2">
                {toc.map((t, idx) => (
                  <li key={idx}>
                    <a
                      href={`#block-${post.contentBlocks.indexOf(post.contentBlocks.find(b => b.text === t.text))}`}
                      className="text-sm hover:text-blue-400"
                    >
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
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
