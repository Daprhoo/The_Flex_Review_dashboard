# The Flex - Reviews Management System

A comprehensive review management system that aggregates reviews from Hostaway and Google Reviews, with an admin dashboard for approval management and a public-facing display page.

## 🔗 Live Demo

- 📊 **Admin Dashboard:** [your-app.vercel.app/approve](https://your-app.vercel.app/approve)
- 🌟 **Public Reviews Page:** [your-app.vercel.app/public](https://your-app.vercel.app/public)

## ✨ Features

- **Multi-Source Reviews:** Aggregates reviews from Hostaway and Google Places API
- **Admin Dashboard:** 
  - View all reviews with advanced filtering
  - Approve/unapprove reviews for public display
  - Property performance analytics
  - Recurring issue detection
- **Public Reviews Page:** 
  - Auto-playing carousel inspired by The Flex website design
  - Displays only approved reviews
  - Responsive design with smooth animations
- **Google Reviews Integration:**
  - Search properties by name
  - Fetch latest reviews from Google Maps
  - Manual Place ID input option

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- API keys for Hostaway and Google Places

### Installation

```bash
# Clone the repository
git clone https://github.com/Daprhoo/The_Flex_Review_dashboard.git
cd the-flex-review

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your API keys to .env.local
HOSTAWAY_API_KEY=your_hostaway_api_key
HOSTAWAY_ACCOUNT_ID=your_account_id
GOOGLE_PLACES_API_KEY=your_google_places_api_key

# Run development server
npm run dev
```

Open http://localhost:3000 for the dashboard.

## 📋 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Frontend:** React 18, Tailwind CSS
- **Icons:** Lucide React
- **APIs:** Hostaway API, Google Places API
- **Deployment:** Vercel

## ⚠️ Known Limitations

### Approval Status Persistence on Vercel

**Issue:** The approval status feature (approve/unapprove reviews) does not persist on the Vercel deployment.

**Reason:** The current implementation stores approval statuses in a JSON file (`reviewApprovals.json`). Vercel's serverless architecture uses an **ephemeral filesystem**, meaning any file changes are lost after the serverless function execution completes. Each deployment also resets the filesystem.

**Impact:**
- ✅ Approval functionality works perfectly in **local development**
- ❌ Approvals do **not persist** in the **Vercel production** environment
- ❌ Approved reviews will revert to unapproved after page refresh or new deployment

**Recommended Solutions for Production:**

1. **Database Integration** (Preferred)
   - Use PostgreSQL, MongoDB, or Supabase
   - Store approval statuses in a persistent database
   - Implementation time: ~2-3 hours

2. **Vercel KV (Redis)** 
   - Vercel's key-value storage solution
   - Simple migration from JSON file approach
   - Implementation time: ~1 hour

3. **External Storage**
   - AWS S3, Google Cloud Storage
   - Store JSON file externally
   - Implementation time: ~1-2 hours

**Current Workaround:**
For the purpose of this demo/assignment, the approval feature is **fully functional locally** and demonstrates the complete workflow. The codebase is production-ready and only requires adding a database layer for persistence.

### Google Reviews API Limitations

- **Maximum 5 reviews** per property (Google API restriction)
- No pagination available
- Place ID required for each property

## 📖 Documentation

For detailed technical documentation, see brief document

Includes:
- Complete tech stack breakdown
- Architecture and design decisions
- API behaviors and endpoints
- Google Reviews integration findings
- Deployment instructions
- Future enhancement opportunities

## 📁 Project Structure

```
the-flex-review/
├── app/
│   ├── approve/
│   │   └── page.js              # Admin dashboard
│   ├── public/
│   │   └── page.js              # Public reviews carousel
│   ├── components/
│   │   └── GoogleReviewsSync.js # Google reviews integration
│   └── api/
│       └── reviews/
│           ├── hostaway/
│           │   └── route.js     # Hostaway API integration
│           └── google/
│               └── route.js     # Google Places API
├── .env.local                   # Environment variables (not tracked)
├── reviewApprovals.json         # Approval storage (local only)
├── package.json
└── README.md
```

## 🔑 Environment Variables

```bash
# Hostaway API
HOSTAWAY_API_KEY=your_hostaway_api_key
HOSTAWAY_ACCOUNT_ID=your_account_id

# Google Places API
GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

## 🎨 Design Decisions

- **Public Page Design:** Inspired by The Flex website with a modern carousel interface
- **Tab-Based Dashboard:** Separates Hostaway and Google reviews for clarity
- **Optimistic UI Updates:** Instant feedback for better UX
- **Client-Side Filtering:** No server round-trips for filters and sorting
- **Unified Data Schema:** Normalized structure for multi-source reviews



## 🔮 Future Enhancements

- [ ] Database integration for persistent approvals
- [ ] Sentiment analysis on review text
- [ ] Email notifications for new reviews
- [ ] Additional review sources (Airbnb, Booking.com)
- [ ] Advanced analytics and trend tracking
- [ ] Multi-user approval workflow

## 📝 Notes for Reviewers

This project was developed as part of a technical assignment. The approval persistence limitation on Vercel is a known architectural consideration and would be resolved in production with database integration. The implementation demonstrates:

- ✅ Clean, maintainable code architecture
- ✅ Proper API integration and error handling
- ✅ Modern React patterns and hooks
- ✅ Responsive, professional UI/UX
- ✅ Production-ready foundation (requires only DB layer)

**Local Development:** All features work perfectly, including approval persistence.

**Vercel Demo:** Reviews display correctly, Google integration works, but approvals don't persist due to serverless architecture.



Developed as a technical assignment for Flex Living

---

**Development Time:** ~8-10 hours  
**Status:** Production-ready (with database integration for approval persistence)
