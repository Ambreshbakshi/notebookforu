"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const AboutUs = () => {
  const coreValues = [
    {
      title: "Vision",
      description: "To become the most inspiring notebook brand worldwide, where every product sparks creativity and organization.",
      icon: "👁️"
    },
    {
      title: "Mission",
      description: "Craft premium notebooks that blend exceptional quality with beautiful design, making journaling a delightful experience.",
      icon: "🎯"
    },
    {
      title: "Belief",
      description: "We believe that the right notebook can transform thoughts into actions and ideas into reality.",
      icon: "❤️"
    }
  ];

  const founders = [
    {
      name: "Alex Johnson",
      role: "Chief Designer",
      quote: "Innovation starts with a blank page.",
      bio: "With 10+ years in product design, Alex ensures every notebook is both beautiful and functional.",
      image: "/about/founder1.jpg"
    },
    {
      name: "Sam Wilson",
      role: "Production Head",
      quote: "Quality and creativity go hand in hand.",
      bio: "Sam's expertise in sustainable materials guarantees eco-friendly yet durable notebooks.",
      image: "/about/founder2.jpg"
    }
  ];

  const fadeIn = (direction, type, delay, duration) => ({
    hidden: {
      x: direction === 'left' ? 100 : direction === 'right' ? -100 : 0,
      y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
      opacity: 0
    },
    show: {
      x: 0,
      y: 0,
      opacity: 1,
      transition: {
        type,
        delay,
        duration,
        ease: 'easeOut'
      }
    }
  });

  const staggerContainer = (staggerChildren, delayChildren) => ({
    hidden: {},
    show: {
      transition: {
        staggerChildren,
        delayChildren
      }
    }
  });

  return (
    <div className="bg-gray-50 text-gray-900">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
        <Image 
          src="/about/about-us-hero.jpg"
          alt="NotebookForU workspace"
          fill
          className="object-cover"
          priority
        />
        <motion.div 
          initial="hidden"
          animate="show"
          variants={staggerContainer(0.1, 0.2)}
          className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
        >
          <div className="text-center px-4">
            <motion.h1 
              variants={fadeIn('up', 'spring', 0.5, 1)}
              className="text-4xl md:text-6xl font-bold text-white mb-4"
            >
              About NotebookForU
            </motion.h1>
            <motion.p 
              variants={fadeIn('up', 'spring', 0.7, 1)}
              className="text-xl md:text-2xl text-gray-100 max-w-2xl mx-auto"
            >
              Empowering your thoughts with perfectly crafted notebooks
            </motion.p>
          </div>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.25 }}
          variants={staggerContainer(0.1, 0.2)}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="md:flex">
            <motion.div 
              variants={fadeIn('right', 'spring', 0.5, 1)}
              className="md:w-1/2 relative h-64 md:h-auto"
            >
              <Image
                src="/about/our-story.jpg"
                alt="Our notebook design process"
                fill
                className="object-cover"
              />
            </motion.div>
            <div className="p-8 md:p-12 md:w-1/2">
              <motion.h2 
                variants={fadeIn('left', 'spring', 0.3, 1)}
                className="text-3xl font-bold mb-6"
              >
                Our Story
              </motion.h2>
              <motion.p 
                variants={fadeIn('left', 'spring', 0.5, 1)}
                className="text-gray-700 text-lg leading-relaxed"
              >
                Founded in 2020, NotebookForU began as a passion project between two college friends who believed 
                notebooks should be more than just paper. After testing hundreds of materials and designs, we created 
                our signature collection that combines premium paper quality with covers that tell a story. Today, 
                we serve thousands of creatives, professionals, and journal enthusiasts worldwide.
              </motion.p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-gray-100">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-center mb-16"
          >
            Our Core Values
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {coreValues.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-xl shadow-lg text-center"
              >
                <span className="text-4xl mb-4 inline-block">{item.icon}</span>
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founders */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center mb-16"
        >
          Meet Our Founders
        </motion.h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {founders.map((founder, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="flex flex-col md:flex-row gap-6 items-center bg-white p-6 rounded-2xl shadow-lg"
            >
              <div className="relative w-40 h-40 md:w-48 md:h-48 shrink-0">
                <Image
                  src={founder.image}
                  alt={founder.name}
                  fill
                  className="rounded-full object-cover border-4 border-blue-100"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{founder.name}</h3>
                <p className="text-blue-600 font-medium mb-2">{founder.role}</p>
                <blockquote className="text-gray-700 italic mb-3">"{founder.quote}"</blockquote>
                <p className="text-gray-600">{founder.bio}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="py-16 px-4 text-center bg-gradient-to-r from-blue-600 to-blue-800 text-white"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Perfect Notebook?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Explore our curated collections designed for every type of thinker and creator.
          </p>
          <Link href="/notebook-gallery" passHref>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-lg text-lg shadow-lg hover:shadow-xl transition-all"
            >
              Browse Collections
            </motion.button>
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default AboutUs;