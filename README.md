# Weblog Platform

A comprehensive React-based weblog platform with an integrated admin dashboard. Built with React 18, TypeScript, Ant Design, and Tailwind CSS.

## Features

### Admin Dashboard
- 🔐 Secure authentication system
- ✏️ Rich text editor for post creation
- 📝 CRUD operations for blog posts
- 🏷️ Category and tag management
- 📊 Dashboard with statistics
- 👀 Post preview functionality
- 🎯 Draft/published status management

### Public Blog Interface
- 📱 Responsive design for all devices
- 🔍 Search functionality across posts
- 🏷️ Category and tag filtering
- 📖 Clean reading experience
- 🌐 SEO optimization
- 📄 Individual post pages

### Technical Features
- ⚡ XML-based data storage
- 🎨 Ant Design component library
- 💎 Tailwind CSS for styling
- 🚀 Vercel deployment ready
- 📱 Mobile-first responsive design
- ♿ Accessible design (WCAG compliant)

## Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager

### Installation

1. **Clone and setup the project:**
   ```bash
   git clone <your-repo-url>
   cd weblog-platform
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   - Public blog: `http://localhost:5173`
   - Admin dashboard: `http://localhost:5173/admin/login`
   - Admin credentials: `admin` / `admin123`

## Deployment to Vercel

### Automatic Deployment
1. **Connect to Vercel:**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically deploy

2. **Environment Variables:**
   Configure these in your Vercel dashboard:
   ```
   VITE_ADMIN_USERNAME=your-admin-username
   VITE_ADMIN_PASSWORD=your-secure-password
   VITE_SITE_NAME=Your Blog Name
   VITE_SITE_URL=https://your-domain.vercel.app
   ```

### Manual Deployment
```bash
# Build the project
npm run build

# Deploy to Vercel
npx vercel --prod
```

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── Editor/         # Rich text editor
│   └── Layout/         # Layout components
├── context/            # React contexts
├── pages/              # Page components
│   ├── Admin/         # Admin dashboard pages
│   └── Public/        # Public blog pages
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

## Data Management

The platform uses XML files for data storage, simulated through localStorage in the demo. In production, this integrates with:

- **Vercel KV Database** for persistent storage
- **Vercel File System** for XML file management
- **Automatic deployment triggers** when content changes

### Data Structure

```typescript
interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  status: 'draft' | 'published';
  categories: string[];
  tags: string[];
  slug: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
}
```

## Admin Features

### Authentication
- Secure login system
- Session management
- Protected admin routes

### Content Management
- **Rich Text Editor**: Full-featured WYSIWYG editor
- **Post Management**: Create, edit, delete posts
- **Category System**: Organize posts by categories
- **Tag System**: Flexible tagging system
- **SEO Fields**: Meta title and description
- **Preview Mode**: Preview before publishing

### Dashboard
- Post statistics
- Recent posts overview
- Quick actions
- Content analytics

## Public Features

### Blog Interface
- **Homepage**: Grid layout of published posts
- **Post Detail**: Full post view with comments
- **Search**: Full-text search across content
- **Filtering**: Filter by categories and tags
- **Pagination**: Navigate through multiple pages
- **Responsive**: Mobile-first design

### SEO Features
- Dynamic meta tags
- Open Graph tags
- Structured data
- Clean URLs with slugs
- XML sitemap generation

## Customization

### Styling
The platform uses a combination of:
- **Ant Design**: Component library
- **Tailwind CSS**: Utility-first styling
- **Custom CSS**: Component-specific styles

### Color Palette
```css
:root {
  --primary: #1890FF;    /* Ant Design blue */
  --secondary: #52C41A;  /* Success green */
  --background: #F0F2F5; /* Light grey */
  --text: #262626;       /* Dark grey */
  --border: #D9D9D9;     /* Light border */
  --accent: #722ED1;     /* Purple */
}
```

### Typography
- **Primary Font**: Inter
- **Fallbacks**: SF Pro Display, system fonts
- **Base Size**: 16px
- **Line Height**: 1.6 (body), 1.2 (headings)
- **Font Weights**: 400, 500, 600

## Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Code Quality
- **TypeScript**: Full type safety
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git Hooks**: Pre-commit checks

## Production Considerations

### Performance
- Code splitting and lazy loading
- Image optimization
- Caching strategies
- Minimal bundle size

### Security
- Input sanitization
- XSS protection
- CSRF protection
- Secure authentication

### SEO
- Server-side rendering considerations
- Meta tag management
- Structured data
- XML sitemaps

## Browser Support

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile browsers**: iOS Safari, Chrome Mobile
- **JavaScript required**: Progressive enhancement approach

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For questions and support:
- Create an issue on GitHub
- Check the documentation
- Review existing issues and discussions

---

**Built with ❤️ using React, TypeScript, Ant Design, and Tailwind CSS**