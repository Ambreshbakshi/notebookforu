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
    image: '/post1.png',
    content: `Writing with pen and paper activates your creativity and focus in ways typing never can. It builds mindfulness and helps you remember better. Next time, close your laptop and jot ideas by hand.`,
  },
  {
    id: '2',
    title: 'Top 10 Stationery Essentials Every Student and Professional Should Own',
    date: 'September 24, 2025',
    author: 'Admin',
    image: '/post2.png',
    content: `Notebooks, pens, markers, sticky notes, planners — your toolkit defines your productivity. Here’s how to choose the best ones for your workflow.`,
  },
  {
    id: '3',
    title: 'How to Stay Organized: Notebook Hacks You’ll Actually Use',
    date: 'September 12, 2025',
    author: 'Admin',
    image: '/post3.png',
    content: `Divide sections for work, study, and ideas. Use tabs, colors, and bullet journaling to make your notes visually powerful.`,
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

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-100 py-10">
      <div className="max-w-4xl mx-auto px-6">
        <Link href="/blog" className="text-blue-400 hover:underline mb-6 inline-block">
          ← Back to Blog
        </Link>

        <article className="bg-[#121826] rounded-2xl overflow-hidden shadow-lg border border-gray-800 p-8">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-80 object-cover rounded-xl mb-6"
          />
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

          <h1 className="text-4xl font-bold mb-6 text-white">{post.title}</h1>

          <p className="text-gray-300 leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </article>
      </div>
    </div>
  );
}
