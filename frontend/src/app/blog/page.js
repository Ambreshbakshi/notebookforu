'use client';

import React, { useState } from 'react';
import { FiCalendar, FiUser } from 'react-icons/fi';

export default function ThemedBlogPage() {
  const heroImages = ['/hero1.png', '/hero2.png', '/hero3.png'];
  const [index, setIndex] = useState(0);

  const posts = [
    {
      id: 1,
      title: 'The Power of Pen and Paper in the Digital Age',
      date: 'October 27, 2025',
      author: 'NotebookForU Team',
      image: '/post1.png',
      excerpt:
        'In an era ruled by screens, writing with a pen still unlocks deeper focus and creativity. Here’s why you should keep a notebook close by.',
    },
    {
      id: 2,
      title: 'Top 10 Stationery Essentials Every Student and Professional Should Own',
      date: 'October 24, 2025',
      author: 'NotebookForU Team',
      image: '/post2.png',
      excerpt: 'A quick guide to the stationery that makes studying and work flow smoothly.',
    },
    {
      id: 3,
      title: 'How to Stay Organized: Notebook Hacks You’ll Actually Use',
      date: 'September 12, 2025',
      author: 'NotebookForU Team',
      image: '/post3.png',
      excerpt: 'Simple notebook systems that help you focus and get things done.',
    },
  ];

  function prev() {
    setIndex((i) => (i - 1 + heroImages.length) % heroImages.length);
  }

  function next() {
    setIndex((i) => (i + 1) % heroImages.length);
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <header className="py-6 px-6 border-b">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.png" alt="NotebookForU" className="h-10" />
          </div>
          <nav className="flex items-center space-x-6 text-gray-600">
            <a href="#" className="font-medium text-blue-600">Home</a>
            <a href="#">All Products</a>
            <a href="#">Info</a>
            <button className="p-2 rounded-full hover:bg-gray-100">🔍</button>
            <button className="p-2 rounded-full hover:bg-gray-100">🛒</button>
          </nav>
        </div>
      </header>

      <section className="relative">
        <div className="max-w-6xl mx-auto">
          <div className="relative h-96 md:h-[520px] overflow-hidden rounded-b-2xl">
            <img
              src={heroImages[index]}
              alt="hero"
              className="absolute inset-0 w-full h-full object-cover filter blur-sm brightness-75"
            />

            <div className="absolute inset-0 flex items-center justify-center px-6">
              <div className="text-center max-w-2xl">
                <h1 className="text-5xl md:text-6xl font-extrabold text-white drop-shadow-lg">
                  Make It Your Own
                </h1>
                <p className="mt-4 text-lg text-white/90">Discover our premium collection of handcrafted notebooks</p>

                <div className="mt-8 flex items-center justify-center gap-4">
                  <a href="#" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-full font-semibold shadow-lg">Browse Collection</a>
                </div>

                <div className="mt-6 flex items-center justify-center space-x-2">
                  {heroImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`w-3 h-3 rounded-full ${i === index ? 'bg-white' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <button onClick={prev} className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center">‹</button>
            <button onClick={next} className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 flex items-center justify-center">›</button>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <blockquote className="text-2xl md:text-3xl italic text-slate-700 leading-relaxed">"Your thoughts, your words, your notebook: where inspiration meets expression."</blockquote>
          <div className="mt-4 text-blue-600 font-medium">— NotebookForU Team</div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-8">From the Blog</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posts.map((p) => (
              <article key={p.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
                <div className="p-6">
                  <div className="text-sm text-blue-600 mb-2">{p.date} • {p.author}</div>
                  <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
                  <p className="text-sm text-gray-600 mb-4">{p.excerpt}</p>
                  <a href="#" className="text-blue-600 font-medium">Read More →</a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">© {new Date().getFullYear()} NotebookForU — All rights reserved</div>
      </footer>
    </div>
  );
}
