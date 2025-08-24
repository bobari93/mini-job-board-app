# Mini Job Board App

A full-stack job board application built with Next.js, Supabase, and Tailwind CSS. Users can post, browse, and manage job listings with authentication and real-time updates.

## 🌟 Features

### Core Features

#### 🔐 Authentication (Supabase Auth)
- User registration and login
- Secure authentication with Supabase
- Protected admin routes
- Session management

#### 📝 Post a Job
Authenticated users can create job posts with:
- **Title**: Job position title
- **Company Name**: Hiring company
- **Description**: Detailed job description
- **Location**: Job location (Remote, New York, San Francisco, etc.)
- **Job Type**: Full-Time, Part-Time, Contract, Internship, Remote

#### 🔍 Browse Jobs
- **Public Page**: Anyone can view job listings without authentication
- **Search**: Search by job title, company, description, or location
- **Filtering**: Filter by job type and location
- **Pagination**: Efficient pagination with customizable items per page
- **Job Detail Links**: Click job titles to view full details in new tabs
- **Responsive Design**: Mobile-friendly interface

#### 📄 Job Detail Page
- **Comprehensive View**: Complete job details with full description
- **Company Information**: Company details and location
- **Job Metadata**: Posted date, job type badges, and time ago
- **Application Options**: Apply via email and view company website
- **Share Functionality**: Copy link and share job listings
- **Responsive Design**: Mobile-friendly layout with sidebar

#### 👤 User Dashboard
- **View Jobs**: See all jobs you've posted
- **Edit Jobs**: Update job details
- **Delete Jobs**: Remove job listings
- **Statistics**: View job statistics (total, active, remote jobs)
- **Search & Filter**: Find specific jobs in your dashboard

### Technical Features

#### 🎨 UI/UX
- **Dark/Light Mode**: Theme switching with system preference detection
- **Responsive Design**: Mobile-first approach
- **Modern UI**: Clean, professional interface using Tailwind CSS
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error states and user feedback
- **Password Visibility**: Eye icons to toggle password visibility in forms

#### ⚡ Performance
- **Server-side Pagination**: Efficient data loading
- **Optimized Queries**: Supabase client-side filtering
- **Fast Loading**: Optimized for performance
- **SEO Friendly**: Proper meta tags and structure

## 🛠️ Tech Stack

### Frontend
- **Next.js 15**: App Router for modern React development
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Beautiful, customizable icons
- **Radix UI**: Accessible UI components

### Backend
- **Supabase**: Database and authentication
- **PostgreSQL**: Relational database
- **Row Level Security (RLS)**: Secure data access policies

### Deployment
- **Vercel**: Production deployment
- **Supabase**: Database hosting and management

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Quick Demo
- **Live Demo**: <a href="https://mini-job-board-app-zeta.vercel.app" target="_blank" rel="noopener noreferrer">https://mini-job-board-app-zeta.vercel.app</a>
- **Admin Access**: <a href="https://mini-job-board-app-zeta.vercel.app/login" target="_blank" rel="noopener noreferrer">https://mini-job-board-app-zeta.vercel.app/login</a>

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/bobari93/mini-job-board-app.git
   cd mini-job-board-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Get your project URL and anon key

4. **Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

5. **Database Setup**
   Run the following SQL in your Supabase SQL Editor:
   ```sql
   -- Create the job table
   CREATE TABLE job (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     title TEXT NOT NULL,
     company_name TEXT NOT NULL,
     description TEXT NOT NULL,
     location TEXT NOT NULL,
     job_type TEXT[] NOT NULL,
     user_id UUID REFERENCES auth.users(id),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE job ENABLE ROW LEVEL SECURITY;

   -- Policy for ALL users to read jobs (public access)
   CREATE POLICY "Allow all users to read jobs" ON job
   FOR SELECT
   TO public
   USING (true);

   -- Policy for authenticated users to insert jobs
   CREATE POLICY "Allow authenticated users to insert jobs" ON job
   FOR INSERT
   TO authenticated
   WITH CHECK (auth.uid() = user_id);

   -- Policy for authenticated users to update their own jobs
   CREATE POLICY "Allow authenticated users to update own jobs" ON job
   FOR UPDATE
   TO authenticated
   USING (auth.uid() = user_id)
   WITH CHECK (auth.uid() = user_id);

   -- Policy for authenticated users to delete their own jobs
   CREATE POLICY "Allow authenticated users to delete own jobs" ON job
   FOR DELETE
   TO authenticated
   USING (auth.uid() = user_id);
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)
   Navigate to [http://localhost:3000/login](http://localhost:3000/login) for admin access

## 📁 Project Structure

```
mini-job-board-app/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard routes
│   │   ├── job/                  # Job management routes
│   │   │   ├── add/             # Add job page
│   │   │   └── [id]/            # Edit job page
│   │   └── layout.tsx           # Admin layout
│   ├── auth/                     # Authentication pages
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── ...
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Public home page
├── components/                   # React components
│   ├── ui/                      # Reusable UI components
│   ├── job/                     # Job-related components
│   └── theme-switcher.tsx       # Theme switching
├── hooks/                       # Custom React hooks
│   └── useJobs.ts              # Job data management
├── lib/                         # Utility libraries
│   └── supabase/               # Supabase client setup
├── types/                       # TypeScript type definitions
└── public/                      # Static assets
```

## 🏗️ Architecture Overview

### Frontend Architecture
- **App Router**: Next.js 15 App Router for file-based routing
- **Client Components**: Interactive components with "use client"
- **Server Components**: Static components for better performance
- **Custom Hooks**: Centralized data management with `useJobs`
- **Component Library**: Reusable UI components with Radix UI

### Backend Architecture
- **Supabase**: Backend-as-a-Service for database and auth
- **PostgreSQL**: Relational database with RLS policies
- **Real-time**: Built-in real-time capabilities
- **Storage**: File storage for future enhancements

### Data Flow
1. **Public Access**: Anonymous users can browse jobs
2. **Authentication**: Users sign up/login via Supabase Auth
3. **Job Management**: Authenticated users can CRUD their jobs
4. **Security**: RLS policies ensure data security

## 🚀 Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Environment Variables in Vercel**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 🔧 Key Features Implementation

### Authentication Flow
- Supabase Auth integration
- Protected routes with middleware
- Session management
- User-specific data access

### Job Management
- CRUD operations with Supabase
- Real-time updates
- Optimistic UI updates
- Error handling and validation

### Search & Filtering
- Client-side filtering with Supabase
- Server-side pagination
- Efficient query optimization
- Responsive filter UI

### Theme System
- Dark/light mode support
- System preference detection
- Persistent theme storage
- Smooth transitions

## 🧪 Testing

The application includes:
- TypeScript for type safety
- ESLint for code quality
- Responsive design testing
- Cross-browser compatibility

## 📱 Mobile Responsiveness

- Mobile-first design approach
- Responsive breakpoints
- Touch-friendly interfaces
- Optimized for all screen sizes

## 🔒 Security Features

- Row Level Security (RLS) policies
- Authenticated user validation
- Secure API endpoints
- Input validation and sanitization

## 🚀 What Would I Improve If Given More Time?

### Immediate Improvements
1. **Job Applications**: Add application system for job seekers
2. **Email Notifications**: Notify users of new job matches
3. **Advanced Search**: Full-text search with filters
4. **Job Categories**: Industry-specific job categories
5. **Company Profiles**: Detailed company information pages

### Technical Enhancements
1. **Testing**: Add comprehensive unit and integration tests
2. **Performance**: Implement caching and CDN optimization
3. **Analytics**: User behavior tracking and job performance metrics
4. **Real-time Features**: Live job updates and notifications

### User Experience
1. **Job Alerts**: Email notifications for new matching jobs
2. **Saved Jobs**: Bookmark favorite job listings
3. **Multi-language Support**: Internationalization

### Advanced Features
1. **API Integration**: Third-party job board integrations
2. **Advanced Filtering**: Salary range, experience level, etc.
3. **Social Features**: Share jobs on social media

## 👨‍💻 Author

Bobby Arianto - [GitHub](https://github.com/bobari93)

## 🔗 Links

- **Live Demo**: <a href="https://mini-job-board-app-zeta.vercel.app" target="_blank" rel="noopener noreferrer">https://mini-job-board-app-zeta.vercel.app</a>
- **Admin Access**: <a href="https://mini-job-board-app-zeta.vercel.app/login" target="_blank" rel="noopener noreferrer">https://mini-job-board-app-zeta.vercel.app/login</a>
- **GitHub Repository**: <a href="https://github.com/bobari93/mini-job-board-app" target="_blank" rel="noopener noreferrer">https://github.com/bobari93/mini-job-board-app</a>

---

Built with using Next.js, Supabase, and Tailwind CSS
