'use client';

import React from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

// NOTE: Put your hero image in /public/blog-hero.png (or change src to your image path)
export default function BlogPageWithSidebar() {
  const posts = [
    {
      id: 1,
      title: 'Linc Smart GL: The Perfect Pen For Students And Professionals',
      date: 'October 24, 2025',
      author: 'Admin',
      excerpt:
        'In the fast-paced world we find ourselves with today, and the speed at which ideas can move these days, you will find a real difference with the right pen in hand. At Linc we believe with comfort, innovative function, and performance in mind.',
      image: '/blog-hero.png',
    },
    {
      id: 2,
      title: 'How Linc Limited Creates Smooth Writing Pens For Stress-Free Note-Taking',
      date: 'September 10, 2025',
      author: 'Admin',
      excerpt: 'A quick look into manufacturing and design choices that make writing effortless.',
      image: '/blog-hero.png',
    },
    {
      id: 3,
      title: 'Best Ball Pens For Everyday Writing',
      date: 'August 5, 2025',
      author: 'Admin',
      excerpt: 'Comparing popular ball pens to help you pick the right everyday companion.',
      image: '/blog-hero.png',
    },
    {
      id: 4,
      title: 'Notebook Organization Tips For Students',
      date: 'July 2, 2025',
      author: 'Admin',
      excerpt: 'Simple, actionable notebook hacks that actually help you study better.',
      image: '/blog-hero.png',
    },
    {
      id: 5,
      title: 'Stationery That Sparks Creativity',
      date: 'June 12, 2025',
      author: 'Admin',
      excerpt: 'How colors, textures and design can influence your creative flow.',
      image: '/blog-hero.png',
    },
  ];

  const mainPost = posts[0];
  const latest = posts.slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 py-10">
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main area (two-thirds) */}
        <main className="lg:col-span-2">
          <article className="bg-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="h-56 md:h-64 lg:h-72 bg-gray-700 relative">
              <img
                src={mainPost.image}
                alt={mainPost.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-8">
              <div className="flex items-center text-sm text-blue-300 space-x-4 mb-4">
                <div className="flex items-center">
                  <FiCalendar className="mr-2" />
                  <span>{mainPost.date}</span>
                </div>
                <div className="flex items-center">
                  <FiUser className="mr-2" />
                  <span>by {mainPost.author}</span>
                </div>
              </div>

              <h2 className="text-4xl font-extrabold leading-tight mb-4 text-white">
                {mainPost.title}
              </h2>

              <p className="text-lg text-gray-200 mb-6">{mainPost.excerpt} [...]</p>

              <a
                href="#"
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-md transition"
              >
                → Read More
              </a>
            </div>
          </article>

          {/* Optional: other posts list below the main article */}
          <div className="mt-8 space-y-6">
            {posts.slice(1).map((p) => (
              <article key={p.id} className="flex bg-gray-800 rounded-xl overflow-hidden">
                <img src={p.image} alt={p.title} className="w-36 h-36 object-cover" />
                <div className="p-4 flex-1">
                  <div className="text-sm text-blue-300 mb-1">{p.date} • by {p.author}</div>
                  <h3 className="font-bold text-lg text-white">{p.title}</h3>
                  <p className="text-sm text-gray-300 mt-2">{p.excerpt}</p>
                </div>
              </article>
            ))}
          </div>
        </main>

        {/* Sidebar (one-third) */}
        <aside className="sticky top-20">
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
            <h4 className="text-2xl font-bold mb-6">Latest Posts</h4>

            <div className="space-y-6">
              {latest.map((l) => (
                <div key={l.id} className="flex items-start space-x-4">
                  <img src={l.image} alt={l.title} className="w-20 h-14 object-cover rounded" />
                  <div>
                    <div className="text-sm text-blue-300 mb-1">By {l.author}</div>
                    <a href="#" className="font-semibold text-white block leading-tight">
                      {l.title}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Optional reach us vertical button like the screenshot */}
          <div className="mt-6 flex justify-center">
            <button className="transform rotate-90 bg-white text-blue-800 px-3 py-2 rounded shadow">REACH US</button>
          </div>
        </aside>
      </div>
    </div>
  );
}
