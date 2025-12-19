# StudyLinker Landing Page

## Overview
A beautiful, modern landing page for StudyLinker - an online tuition marketplace connecting parents and students with qualified teachers worldwide.

## Features

### 🎨 Design & Animations
- **Three.js 3D Background**: Interactive animated sphere with particles in the hero section
- **Framer Motion**: Smooth scroll animations and transitions throughout
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional design with gradient accents

### 📦 Components Created

#### Landing Sections
1. **Hero** (`src/components/landing/Hero.tsx`)
   - Eye-catching hero with 3D background
   - Call-to-action buttons for parents and teachers
   - Key statistics showcase
   - Wave divider transition

2. **Features** (`src/components/landing/Features.tsx`)
   - 6 key platform features with icons
   - Scroll-triggered animations
   - Gradient-colored feature cards

3. **Stats** (`src/components/landing/Stats.tsx`)
   - Platform statistics (teachers, students, countries)
   - Animated counters on scroll

4. **How It Works** (`src/components/landing/HowItWorks.tsx`)
   - 4-step process explanation
   - Alternating animations
   - Clear visual hierarchy

5. **For Parents** (`src/components/landing/ForParents.tsx`)
   - Parent-focused benefits
   - Feature list with icons
   - CTA button

6. **For Teachers** (`src/components/landing/ForTeachers.tsx`)
   - Teacher-focused benefits
   - Career growth messaging
   - Application CTA

7. **Testimonials** (`src/components/landing/Testimonials.tsx`)
   - User testimonials with ratings
   - Social proof section

8. **CTA** (`src/components/landing/CTA.tsx`)
   - Final call-to-action
   - Dual CTAs for parents and teachers

#### Updated Components
- **Navbar** (`src/components/common/Navbar/NavItems/data.ts`)
  - Updated menu items for StudyLinker
  - For Parents, For Teachers, Subjects, About sections

- **Footer** (`src/components/common/Footer/`)
  - Updated footer links
  - Removed newsletter subscription
  - Added social media icons (React Icons)
  - Updated branding

- **Logo** (`src/components/common/Navbar/Logo.tsx`)
  - Changed from SmartlyQ to StudyLinker

## Tech Stack

### Core
- **Next.js 16.1.0** - React framework
- **React 19.2.3** - UI library
- **TypeScript** - Type safety

### Styling
- **Tailwind CSS 4** - Utility-first CSS
- **shadcn/ui** - UI components

### 3D & Animations
- **Three.js** - 3D graphics
- **@react-three/fiber** - React renderer for Three.js
- **@react-three/drei** - Three.js helpers
- **Framer Motion** - Animation library

### Icons
- **React Icons** - Icon library (Bootstrap Icons)
- **Lucide React** - Additional icons

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the landing page.

### Build
```bash
npm run build
npm start
```

## Color Scheme

### Primary Colors
- **Indigo**: `from-indigo-600 to-purple-600` - Primary gradient
- **Purple**: Accent color for CTAs
- **Blue**: Secondary accent

### Backgrounds
- White and light gray backgrounds
- Gradient overlays for depth

## Customization

### Updating Content
- **Statistics**: Edit values in `src/components/landing/Hero.tsx` and `Stats.tsx`
- **Features**: Modify feature list in `src/components/landing/Features.tsx`
- **Testimonials**: Update testimonials array in `src/components/landing/Testimonials.tsx`

### Styling
- Global styles: `src/app/globals.css`
- Component-specific styles: Inline Tailwind classes
- Color scheme: Tailwind CSS custom colors in globals.css

### Navigation
- Menu items: `src/components/common/Navbar/NavItems/data.ts`
- Footer links: `src/components/common/Footer/data.ts`

## Performance Optimizations

- **Dynamic imports**: Three.js components loaded on demand
- **Image optimization**: Next.js Image component
- **Lazy loading**: Scroll-triggered animations only load when in view
- **Code splitting**: Automatic with Next.js

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes

- The Three.js background is GPU-intensive; consider disabling on mobile for better performance
- All animations use `framer-motion` with `useInView` for performance
- Social media links in footer need to be updated with actual URLs
- Images in the public folder can be replaced with actual brand assets

## Future Enhancements

- Add actual teacher/parent portal links
- Integrate with backend API for dynamic content
- Add more interactive 3D elements
- Implement dark mode toggle
- Add blog section with real content
- Create subject-specific landing pages

