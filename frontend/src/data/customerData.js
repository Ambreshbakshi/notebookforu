// src/data/customerData.js
const customerData = {
    // Initial customer data
    customers: [
      {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
        address: {
          street: "123 Main St",
          city: "Cityville",
          state: "CA",
          zip: "90210",
          country: "USA"
        },
        orders: [
          {
            orderId: "NB1001",
            date: "2023-05-15",
            items: [
              { productId: "NB-A5-100", name: "A5 Notebook", quantity: 2, price: 12.99 },
              { productId: "PEN-SET1", name: "Premium Pen Set", quantity: 1, price: 9.99 }
            ],
            subtotal: 35.97,
            tax: 2.88,
            shipping: 5.00,
            total: 43.85,
            status: "delivered"
          }
        ],
        reviews: [
          {
            reviewId: "REV1001",
            productId: "NB-A5-100",
            productName: "A5 Notebook",
            rating: 5,
            comment: "Great quality notebooks! The paper is thick and perfect for all my writing needs.",
            date: "2023-05-20",
            images: ["/reviews/notebook-review1.jpg"]
          }
        ],
        wishlist: ["NB-A4-200", "PEN-SET2"]
      },
      {
        id: 2,
        name: "Emily Smith",
        email: "emily@example.com",
        phone: "+1987654321",
        address: {
          street: "456 Oak Ave",
          city: "Townsville",
          state: "NY",
          zip: "10001",
          country: "USA"
        },
        orders: [
          {
            orderId: "NB1002",
            date: "2023-06-10",
            items: [
              { productId: "NB-B5-150", name: "B5 Notebook", quantity: 1, price: 14.99 },
              { productId: "STICKER-SET1", name: "Decorative Stickers", quantity: 3, price: 2.50 }
            ],
            subtotal: 22.49,
            tax: 1.80,
            shipping: 0.00,
            total: 24.29,
            status: "shipped"
          }
        ],
        reviews: [
          {
            reviewId: "REV1002",
            productId: "NB-B5-150",
            productName: "B5 Notebook",
            rating: 4,
            comment: "Loved the customization options! Being able to add my name made it extra special.",
            date: "2023-06-15",
            images: []
          }
        ],
        wishlist: ["NB-A5-100", "STICKER-SET2"]
      }
    ],
  
    // ========================
    // Customer CRUD Operations
    // ========================
  
    getAllCustomers() {
      return this.customers;
    },
  
    getCustomerById(id) {
      return this.customers.find(customer => customer.id === id);
    },
  
    getCustomerByEmail(email) {
      return this.customers.find(customer => customer.email === email);
    },
  
    addCustomer(newCustomer) {
      const id = this.customers.length > 0 
        ? Math.max(...this.customers.map(c => c.id)) + 1 
        : 1;
      const customer = {
        id,
        ...newCustomer,
        orders: [],
        reviews: [],
        wishlist: []
      };
      this.customers.push(customer);
      return customer;
    },
  
    updateCustomer(id, updatedData) {
      const index = this.customers.findIndex(c => c.id === id);
      if (index !== -1) {
        this.customers[index] = { ...this.customers[index], ...updatedData };
        return true;
      }
      return false;
    },
  
    deleteCustomer(id) {
      const initialLength = this.customers.length;
      this.customers = this.customers.filter(customer => customer.id !== id);
      return this.customers.length !== initialLength;
    },
  
    // =====================
    // Order Management
    // =====================
  
    getOrdersByCustomer(customerId) {
      const customer = this.getCustomerById(customerId);
      return customer ? customer.orders : [];
    },
  
    getOrderById(customerId, orderId) {
      const customer = this.getCustomerById(customerId);
      if (!customer) return null;
      return customer.orders.find(order => order.orderId === orderId);
    },
  
    addOrder(customerId, newOrder) {
      const customer = this.getCustomerById(customerId);
      if (!customer) return false;
      
      // Generate order ID
      const orderId = `NB${1000 + customer.orders.length + 1}`;
      
      const order = {
        orderId,
        date: new Date().toISOString().split('T')[0],
        ...newOrder,
        status: "processing"
      };
      
      customer.orders.push(order);
      return order;
    },
  
    updateOrderStatus(customerId, orderId, newStatus) {
      const order = this.getOrderById(customerId, orderId);
      if (!order) return false;
      order.status = newStatus;
      return true;
    },
  
    // =====================
    // Review Management
    // =====================
  
    getAllReviews() {
      return this.customers.flatMap(customer => 
        customer.reviews.map(review => ({
          ...review,
          customerId: customer.id,
          customerName: customer.name,
          customerImage: `/customers/customer${customer.id}.png`
        }))
      );
    },
  
    getReviewsByProduct(productId) {
      return this.getAllReviews().filter(review => review.productId === productId);
    },
  
    addReview(customerId, productId, reviewData) {
      const customer = this.getCustomerById(customerId);
      if (!customer) return false;
      
      // Check if customer purchased the product
      const hasPurchased = customer.orders.some(order => 
        order.items.some(item => item.productId === productId)
      );
      
      if (!hasPurchased) return false;
      
      const reviewId = `REV${1000 + customer.reviews.length + 1}`;
      
      const review = {
        reviewId,
        productId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        date: new Date().toISOString().split('T')[0],
        images: reviewData.images || []
      };
      
      customer.reviews.push(review);
      return review;
    },
  
    // =====================
    // Wishlist Management
    // =====================
  
    getWishlist(customerId) {
      const customer = this.getCustomerById(customerId);
      return customer ? customer.wishlist : [];
    },
  
    addToWishlist(customerId, productId) {
      const customer = this.getCustomerById(customerId);
      if (!customer) return false;
      
      if (!customer.wishlist.includes(productId)) {
        customer.wishlist.push(productId);
        return true;
      }
      return false;
    },
  
    removeFromWishlist(customerId, productId) {
      const customer = this.getCustomerById(customerId);
      if (!customer) return false;
      
      const initialLength = customer.wishlist.length;
      customer.wishlist = customer.wishlist.filter(id => id !== productId);
      return customer.wishlist.length !== initialLength;
    },
  
    // =====================
    // Analytics
    // =====================
  
    getTopRatedProducts(limit = 5) {
      const allReviews = this.getAllReviews();
      const productRatings = {};
      
      allReviews.forEach(review => {
        if (!productRatings[review.productId]) {
          productRatings[review.productId] = {
            productId: review.productId,
            productName: review.productName,
            totalRating: 0,
            reviewCount: 0
          };
        }
        productRatings[review.productId].totalRating += review.rating;
        productRatings[review.productId].reviewCount++;
      });
      
      return Object.values(productRatings)
        .map(product => ({
          ...product,
          averageRating: product.totalRating / product.reviewCount
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, limit);
    },
  
    getCustomerOrderHistory(customerId) {
      const customer = this.getCustomerById(customerId);
      if (!customer) return [];
      
      return customer.orders
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(order => ({
          ...order,
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
        }));
    }
  };
  
  export default customerData;