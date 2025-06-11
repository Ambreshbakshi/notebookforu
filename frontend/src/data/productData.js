const productData = {
  notebooks: {
    1: {
      id: 1,
      name: "Notebook | Vines",
      price: 75,
      gridImage: "/products/notebook/notebook1/notebook1-cover.png",
      detailImage1: "/products/notebook/notebook1/notebook1-detail1.jpg",
      detailImage2: "/products/notebook/notebook1/notebook1-detail2.jpg",
      detailImage3: "/products/notebook/notebook1/notebook1-detail3.jpg",
      detailImage4: "/products/notebook/notebook1/notebook1-detail4.jpg",
      detailImage5: "/products/notebook/notebook1/notebook1-detail5.jpg",
      details: {
        size: "14.9 cm x 20 cm",
        pages: 200,
        material: "Premium Matte Cover",
        binding: "Wiro Binding",
        gsm: 120,
        description: "A beautifully crafted notebook with nature-inspired vines design, perfect for journaling or sketching."
      },
    },
    2: {
      id: 2,
      name: "Notebook | Sunset",
      price: 115,
      gridImage: "/products/notebook/notebook2/notebook2-cover.png",
      detailImage1: "/products/notebook/notebook2/notebook2-detail1.jpg",
      detailImage2: "/products/notebook/notebook2/notebook2-detail2.jpg",
      detailImage3: "/products/notebook/notebook2/notebook2-detail3.jpg",
      detailImage4: "/products/notebook/notebook2/notebook2-detail4.jpg",
      detailImage5: "/products/notebook/notebook2/notebook2-detail5.jpg",
      details: {
        size: "15 cm x 21 cm",
        pages: 300,
        material: "Glossy Hardcover",
        binding: "Perfect Binding",
        gsm: 130,
        description: "Capture your thoughts under the hues of a stunning sunset. A vibrant and durable notebook for all creatives."
      },
    },
    3: {
      id: 3,
      name: "Notebook | Ocean",
      price: 135,
      gridImage: "/products/notebook/notebook3/notebook3-cover.png",
      detailImage1: "/products/notebook/notebook3/notebook3-detail1.jpg",
      detailImage2: "/products/notebook/notebook3/notebook3-detail2.jpg",
      detailImage3: "/products/notebook/notebook3/notebook3-detail3.jpg",
      detailImage4: "/products/notebook/notebook3/notebook3-detail4.jpg",
      detailImage5: "/products/notebook/notebook3/notebook3-detail5.jpg",
      details: {
        size: "16 cm x 22 cm",
        pages: 400,
        material: "Soft-touch Velvet Cover",
        binding: "Spiral Binding",
        gsm: 140,
        description: "Feel the waves of creativity flow with this ocean-themed notebook, featuring soft-touch covers and smooth pages."
      },
    },
    4: {
      id: 4,
      name: "Notebook | Galaxy",
      price: 95,
      gridImage: "/products/notebook/notebook4/notebook4-cover.png",
      detailImage1: "/products/notebook/notebook4/notebook4-detail1.jpg",
      detailImage2: "/products/notebook/notebook4/notebook4-detail2.jpg",
      detailImage3: "/products/notebook/notebook4/notebook4-detail3.jpg",
      detailImage4: "/products/notebook/notebook4/notebook4-detail4.jpg",
      detailImage5: "/products/notebook/notebook4/notebook4-detail5.jpg",
      details: {
        size: "14 cm x 19 cm",
        pages: 250,
        material: "Holographic Cover",
        binding: "Stitched Binding",
        gsm: 125,
        description: "Explore the universe within your thoughts. This galaxy-inspired notebook is perfect for dreamers and stargazers."
      },
    },
    5: {
      id: 5,
      name: "Notebook | Starlit",
      price: 75,
      gridImage: "/products/notebook/notebook5/notebook5-cover.jpg",
      detailImage1: "/products/notebook/notebook5/notebook5-detail1.jpg",
      detailImage2: "/products/notebook/notebook5/notebook5-detail2.jpg",
      detailImage3: "/products/notebook/notebook5/notebook5-detail3.jpg",
      detailImage4: "/products/notebook/notebook5/notebook5-detail4.jpg",
      detailImage5: "/products/notebook/notebook5/notebook5-detail5.jpg",
      details: {
        size: "13 cm x 18 cm",
        pages: 200,
        material: "Matte Softcover",
        binding: "Thread Binding",
        gsm: 110,
        description: "A minimalist yet elegant notebook designed for everyday use, featuring a calming starlit design."
      },
    },
    6: {
      id: 6,
      name: "Notebook | Abstract",
      price: 75,
      gridImage: "/products/notebook/notebook6/notebook6-cover.jpg",
      detailImage1: "/products/notebook/notebook6/notebook6-detail1.jpg",
      detailImage2: "/products/notebook/notebook6/notebook6-detail2.jpg",
      detailImage3: "/products/notebook/notebook6/notebook6-detail3.jpg",
      detailImage4: "/products/notebook/notebook6/notebook6-detail4.jpg",
      detailImage5: "/products/notebook/notebook6/notebook6-detail5.jpg",
      details: {
        size: "15 cm x 21 cm",
        pages: 300,
        material: "Textured Cardboard Cover",
        binding: "Spiral Binding",
        gsm: 135,
        description: "A modern and artistic notebook that adds a creative touch to your notes and sketches."
      },
    },
  },

  diaries: {
    1: {
      id: 1,
      name: "Diary | Nebulae",
      price: 50,
      gridImage: "/products/diary/diary1/diary1-cover.png",
      detailImage1: "/products/diary/diary1/diary1-detail1.jpg",
      detailImage2: "/products/diary/diary1/diary1-detail2.jpg",
      detailImage3: "/products/diary/diary1/diary1-detail3.jpg",
      detailImage4: "/products/diary/diary1/diary1-detail4.jpg",
      detailImage5: "/products/diary/diary1/diary1-detail5.jpg",
      details: {
        size: "12 cm x 17 cm",
        pages: 150,
        material: "Soft-touch Matte Cover",
        binding: "Thread Sewn",
        gsm: 100,
        description: "A compact and stylish diary inspired by the cosmos. Perfect for daily notes, goals, and reflections."
      },
    },
    2: {
      id: 2,
      name: "Diary | Sunset",
      price: 60,
      gridImage: "/products/diary/diary2/diary2-cover.png",
      detailImage1: "/products/diary/diary2/diary2-detail1.jpg",
      detailImage2: "/products/diary/diary2/diary2-detail2.jpg",
      detailImage3: "/products/diary/diary2/diary2-detail3.jpg",
      detailImage4: "/products/diary/diary2/diary2-detail4.jpg",
      detailImage5: "/products/diary/diary2/diary2-detail5.jpg",
      details: {
        size: "14 cm x 20 cm",
        pages: 180,
        material: "Hardcover with Gloss Finish",
        binding: "Perfect Binding",
        gsm: 110,
        description: "A warm and elegant diary that captures the beauty of sunsets. Ideal for journaling and creative writing."
      },
    },
  },

  combinations: {
    1: {
      id: 1,
      name: "Space Odyssey Pack of 4",
      price: 400,
      gridImage: "/products/diary/diary1/diary1-cover.png",
      detailImage1: "/products/combination/combination1/combination1-detail1.jpg",
      detailImage2: "/products/diary/diary1/diary1-detail2.jpg",
      detailImage3: "/products/diary/diary1/diary1-detail3.jpg",
      detailImage4: "/products/diary/diary1/diary1-detail4.jpg",
      detailImage5: "/products/diary/diary1/diary1-detail5.jpg",
      details: {
        size: "12 cm x 17 cm",
        pages: 150,
        material: "Soft-touch Matte Cover",
        binding: "Thread Sewn",
        gsm: 100,
        description: "A set of 4 themed notebooks inspired by the cosmos — perfect for gifting or exploring your creativity."
      },
    },
  },
};

export default productData;
