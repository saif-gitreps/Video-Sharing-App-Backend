# ReelDash Short Video App Backend

Backend API server for **ReelDash**, a short-video sharing social media application. Built with **Express.js** and **MongoDB**, it leverages **Mongoose** for data modeling and follows the **MVC pattern** to ensure a scalable and secure backend architecture for seamless frontend integration.

## 🚀 Features

### **API Endpoints**

-  **Authentication:** Sign up, log in, refresh access token, get CSRF token, get current user details, log out, and update user profile.

-  **Videos:** Fetch all videos with query parameters, get a video by ID, publish, delete, update, and fetch random short videos.

-  **Users:** Update cover image and avatar, manage user details, and handle watch history.

-  **Subscriptions:** Toggle subscriptions, check subscription status, and fetch subscribed channels.

-  **Stats:** Retrieve user channel and video stats.

-  **Comments:** Add, delete, and update comments on videos and posts.

-  **Posts:** CRUD operations for update posts.

-  **Likes:** Toggle likes on videos and posts, get like count, and check like status.

### 🔐 Authentication & Security

-  **Stateless JWT authentication** with **refresh and access tokens** stored in secure **HTTP-only cookies**.
-  **Password hashing & encryption** before storing in the database, with decryption for verification.
-  **Role-based access control** (RBAC) for securing endpoints.
-  **Route protection** to prevent unauthenticated access.

### 💻 Tech Stack

-  **Node.js** with **Express.js** for a high-performance API server.
-  **MongoDB** with **Mongoose** ORM, including **aggregation pipeline queries**.
-  **MVC architecture** for maintainability and modularity.
-  **Multer & Cloudinary** for media file uploads and storage.
-  **Custom API response handling** with **structured error** messages.
-  **Paginated queries** for optimized data fetching.
-  **Detailed logging & error tracking** for debugging in development.

### 🎁 Additional Features

-  🔄 **Highly customizable** and extendable for future features.
-  📊 **Optimized queries** with efficient indexing for fast data retrieval.
-  📜 **Comprehensive documentation** for API integration.
