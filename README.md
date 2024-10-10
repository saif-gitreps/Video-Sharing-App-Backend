# Video Sharing Application Backend

Backend API server for the video-sharing social media application built with **Express.js** and utilizes **MongoDB** aggregation pipelining. **Mongoose** was used for data modeling, following the MVC pattern structure to provide a robust platform and secure server for users to interact with video content, create playlists, engage in community discussions, and much more.

<!---
## Table of Contents
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [RESTful APIs](#restful-apis)
-->
## Features

- 🔒 **User Authentication:** Stateless Authentication with JWT. Users can sign up, log in, and manage their accounts securely.
- 📺 **Channel Subscription:** Users can subscribe to other channels or become a channel themselves.
- 📤 **Video Upload:** Users can upload videos to the platform using the **Multer** library.
- ✨ **CRUD Operations on Videos:** Users can create, read, update, and delete videos.
- ☁️ **Cloud Storage:** Uploaded videos, avatars, and cover photos are stored publicly using **Cloudinary**.
- 📚 **Playlist Management:** Users can create playlists, add videos, and manage playlist content.
- 💬 **Community Posts:** Users can create posts, engage in discussions, and interact with other users' posts.
- 💖 **Comments and Likes:** Users can comment on videos and posts, and engage with content by liking them.
- 🍪 **Security:** Utilizes cookies and JWT for enhanced security measures.

<!---
your comment goes here
and here


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


## Usage
To start the server, run the following command:

```
npm start
```

## RESTful APIs
The backend server follows RESTful API principles, allowing the front-end to make proper calls to the server. The API URL's can be accessed in the routes folder of each collection type. 

-->
