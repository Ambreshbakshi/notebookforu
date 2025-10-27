'use client';

import React from 'react';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';

const posts = [
  {
    id: '1',
    title: 'The Power of Pen and Paper in the Digital Age',
    date: 'October 27, 2025',
    author: 'Admin',
    image: '/post1.png',
    excerpt:
      'In an era ruled by screens, typing, and AI, the simple act of writing with a pen still holds incredible power...',
    content: `Full detailed content of The Power of Pen and Paper in the Digital Age.`,
  },
  {
    id: '2',
    title: 'Top 10 Stationery Essentials Every Student and Professional Should Own',
    date: 'October 24, 2025',
    author: 'Admin',
    image: '/post2.png',
    excerpt:
      'Whether you’re a student preparing for exams or a professional managing projects, having the right stationery can make all the difference...',
    content: `Detailed explanation about top 10 stationery items.`,
  },
  {
    id: '3',
    title: 'How to Stay Organized: Notebook Hacks You’ll Actually Use',
    date: 'September 12, 2025',
    author: 'Admin',
    image: '/post3.png',
    excerpt:
      'Organization doesn’t have to be complicated — it just needs consistency. Notebooks are more than blank pages...',
    content: `Detailed tips for organizing notebooks and staying consistent.`,
  },
];

export default function BlogPage() {
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
              {posts.map((l) => (
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

          {/* REACH US BUTTON */}
          <div className="flex justify-center">
            <button className="transform rotate-90 bg-blue-600 text-white px-4 py-2 rounded-md font-semibold tracking-wide shadow-md">
              REACH US
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
