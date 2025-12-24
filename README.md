# Ateliê Belnique Backend

Backend API built with Node.js, Express, and MongoDB.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file (already created) with:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/belnique
   JWT_SECRET=your_secret_key
   ```

3. Run the server:
   ```bash
   npm run dev
   ```

## Models

- **User**: Students, Professors, Collectors, Admins.
- **Course**: Online courses with modules and lessons.
- **Progress**: Tracks student progress in courses.
- **Event**: Workshops, exhibitions, etc.
- **Artwork**: Gallery items for sale or display.
- **Notification**: System alerts and messages.
- **Order**: Purchases (courses, artworks).
- **Resource**: Library content (ebooks, videos).
- **BlogPost**: Community articles.
- **Connection**: Networking/Friendships.

## API Endpoints

### Auth
- `POST /api/users/login` - Authenticate user
- `POST /api/users` - Register user
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile

### Notifications
- `GET /api/notifications` - Get all notifications
- `PUT /api/notifications/:id/read` - Mark specific notification as read
- `PUT /api/notifications/readall` - Mark all as read

### Courses
- `GET /api/courses` - List all courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Professor/Admin only)

## Authentication
Add `Authorization: Bearer <token>` header to protected routes.
