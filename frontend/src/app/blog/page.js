'use client';

import React from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

export default function BlogPage() {
  const posts = [
    {
      id: 1,
      title: 'The Power of Pen and Paper in the Digital Age',
      date: 'October 27, 2025',
      author: 'Admin',
      image: '/post1.png',
      excerpt:
        'In an era ruled by screens, typing, and AI, the simple act of writing with a pen still holds incredible power. While digital tools are fast and convenient, they can never truly replace the creativity that flows from handwriting...',
    },
    {
      id: 2,
      title: 'Top 10 Stationery Essentials Every Student and Professional Should Own',
      date: 'October 24, 2025',
      author: 'Admin',
      image: '/post2.png',
      excerpt:
        'Whether you’re a student preparing for exams or a professional managing projects, having the right stationery can make all the difference...',
    },
    {
      id: 3,
      title: 'How to Stay Organized: Notebook Hacks You’ll Actually Use',
      date: 'September 12, 2025',
      author: 'Admin',
      image: '/post3.png',
      excerpt:
        'Organization doesn’t have to be complicated — it just needs consistency. Notebooks are more than blank pages; they’re powerful tools to bring structure to your life...',
    },
  ];

  const mainPost = posts[0];
  const latest = posts;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* MAIN FEATURED POST */}
        <main className="lg:col-span-2">
          <article className="bg-[#121826] rounded-2xl overflow-hidden shadow-xl border border-gray-800">
            <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
              <img
                src={mainPost.image}
                alt={mainPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <div className="flex items-center text-sm text-blue-400 space-x-4 mb-4">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  <span>{mainPost.date}</span>
                </div>
                <div className="flex items-center">
                  <FiUser className="mr-2" />
                  <span>by {mainPost.author}</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                {mainPost.title}
              </h2>

              <p className="text-gray-300 mb-6">{mainPost.excerpt}</p>

              <a
                href="#"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-md font-semibold transition-all shadow-md"
              >
                → READ MORE
              </a>
            </div>
          </article>

          {/* OTHER POSTS BELOW (OPTIONAL) */}
          <div className="mt-10 space-y-6">
            {posts.slice(1).map((p) => (
              <article
                key={p.id}
                className="flex bg-[#121826] border border-gray-800 rounded-xl overflow-hidden"
              >
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-36 h-36 object-cover"
                />
                <div className="p-4 flex-1">
                  <div className="text-sm text-blue-400 mb-1">
                    {p.date} • by {p.author}
                  </div>
                  <h3 className="font-bold text-lg text-white">{p.title}</h3>
                  <p className="text-sm text-gray-400 mt-2">{p.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
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
                    <a
                      href="#"
                      className="font-semibold text-gray-100 block leading-tight hover:text-blue-400"
                    >
                      {l.title}
                    </a>
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
