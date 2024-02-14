# Video Streaming Site Backend

Welcome to the backend server for our video streaming site! The server is made with Express.js and MongoDB Aggregation pipelining. Mongoose was the framework used for data models and it follows the MVC pattern structure to provide a robust platform and secure server for users to interact with video content, create playlists, engage in community discussions, and much more. 

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
  - [RESTful APIs](#restful-apis)
- [Contributing](#contributing)
- [License](#license)

## Features

Our backend server offers the following features:

- User authentication: Users can sign up, log in, and manage their accounts securely.
- Users can also subscribe to other channels or become a channel.
- Video upload: Users can upload videos to the platform using the Multer library.
- CRUD operations on videos: Users can create, read, update, and delete videos.
- Uploaded videos, avatars, and cover-photos are stored publicly using Cloudinary.
- Playlist management: Users can create playlists, add videos, and manage playlist contents.
- Community posts: Users can create posts, engage in discussions, and interact with other users' posts.
- Comments and likes: Users can comment on videos, and posts, and engage with content by liking them.
- Use of cookies and JWT for added security measures.

## Prerequisites

Before setting up the server, ensure you have the following prerequisites:

- Node.js and npm installed on your system.
- MongoDB installed and running.
- An internet browser for testing API endpoints (e.g., Postman).

## Installation

To install the backend server, follow these steps:

1. Clone the repository:

```
git clone https://github.com/yourusername/video-streaming-backend.git
```
2. Navigate to the project directory:

```
cd video-streaming-backend
```
3. Install dependencies:

```
npm install
```

4. Configuration
Before running the server, you need to configure the environment variables. Create a .env file in the root directory of the project and add the following variables:

```
PORT = 8000
MONGODB_URI = mongodb://localhost:27017
CORS_ORIGIN= <congifure your sites>
ACCESS_TOKEN_SECRET= <add an access token, example: SUPERSECRET1234>
ACCESS_TOKEN_EXPIRY= <add an expiry date, example : 1d>
REFRESH_TOKEN_SECRET= <add a refresh token of your own>
REFRESH_TOKEN_EXPIRY= <add an expiry date, example: 10d>

#create a cloudinary account of your own and add the credentials accordingly.

CLOUDINARY_CLOUD_NAME= <cloudinary name>
CLOUDINARY_API_KEY= <paste it from your cloudinary account>
CLOUDINARY_API_SECRET= <paste it from your cloudinary account>

```


Usage
To start the server, run the following command:

```
npm start
```

Once the server runs, you can start making API requests to interact with the platform.

RESTful APIs
Our backend server follows RESTful API principles, allowing clients to interact with the server through standard HTTP methods such as GET, POST, PUT, and DELETE. Below are the available endpoints and their corresponding functionalities:

User Authentication
```
POST /api/auth/signup: Register a new user.
POST /api/auth/login: Log in an existing user.
```
Video Management
```
GET /api/videos: Retrieve all videos.
GET /api/videos/:id: Retrieve a specific video by ID.
POST /api/videos: Upload a new video.
PUT /api/videos/:id: Update an existing video.
DELETE /api/videos/:id: Delete a video.
```
Playlist Management
```
GET /api/playlists: Retrieve all playlists.
GET /api/playlists/:id: Retrieve a specific playlist by ID.
POST /api/playlists: Create a new playlist.
PUT /api/playlists/:id: Update an existing playlist.
DELETE /api/playlists/:id: Delete a playlist.
```
Community Posts
```
GET /api/posts: Retrieve all community posts.
GET /api/posts/:id: Retrieve a specific post by ID.
POST /api/posts: Create a new post.
PUT /api/posts/:id: Update an existing post.
DELETE /api/posts/:id: Delete a post.
```
Comments
```
GET /api/comments: Retrieve all comments.
GET /api/comments/:id: Retrieve a specific comment by ID.
POST /api/comments: Create a new comment.
PUT /api/comments/:id: Update an existing comment.
DELETE /api/comments/:id: Delete a comment.
```
Likes
```
POST /api/videos/:id/like: Like a video.
POST /api/posts/:id/like: Like a post.
POST /api/comments/:id/like: Like a comment.
```
