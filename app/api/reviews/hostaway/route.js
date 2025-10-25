import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Hostaway API Configuration
const HOSTAWAY_API_URL = 'https://api.hostaway.com/v1/reviews';
const HOSTAWAY_ACCOUNT_ID = process.env.HOSTAWAY_ACCOUNT_ID;
const HOSTAWAY_API_KEY = process.env.HOSTAWAY_API_KEY;

// POST - Approval update
export async function POST(req) {
  try {
    const { id, approved } = await req.json();

    const filePath = path.join(process.cwd(), 'public', 'mock_reviews.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const mockData = JSON.parse(fileContents);

    const review = mockData.result.find(r => r.id === id);
    if (review) {
      review.approved = approved;
      fs.writeFileSync(filePath, JSON.stringify(mockData, null, 2), 'utf8');
      
      return NextResponse.json({ 
        status: 'success', 
        id, 
        approved,
        message: `Review ${approved ? 'approved' : 'unapproved'} successfully`
      });
    }

    return NextResponse.json({ 
      status: 'error', 
      message: 'Review not found' 
    }, { status: 404 });

  } catch (error) {
    console.error('Error updating approval:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: error.message 
    }, { status: 500 });
  }
}

// GET - Reviews fetch
export async function GET() {
  try {
    console.log('🔄 Attempting to fetch from Hostaway API...');
    
    // try to fetch from Hostaway API
    try {
      const response = await fetch(HOSTAWAY_API_URL, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${HOSTAWAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        // Timeout 
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const apiData = await response.json();
        
        // If API returns valid data
        if (apiData.result && apiData.result.length > 0) {
          console.log('✅ Successfully fetched from Hostaway API');
          const normalizedReviews = normalizeReviews(apiData.result);
          const stats = calculateStats(normalizedReviews);
          
          return NextResponse.json({
            status: 'success',
            data: normalizedReviews,
            stats,
            source: 'hostaway-api',
            timestamp: new Date().toISOString()
          });
        }
        
        console.log('⚠️ Hostaway API returned empty result, using mock data...');
      } else {
        console.log(`⚠️ Hostaway API returned status ${response.status}, using mock data...`);
      }
    } catch (apiError) {
      console.log('⚠️ Failed to fetch from Hostaway API:', apiError.message);
      console.log('📦 Falling back to mock data...');
    }

    // Fallback to mock data
    const filePath = path.join(process.cwd(), 'public', 'mock_reviews.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const mockData = JSON.parse(fileContents);

    const normalizedReviews = normalizeReviews(mockData.result);
    const stats = calculateStats(normalizedReviews);

    return NextResponse.json({
      status: 'success',
      data: normalizedReviews,
      stats,
      source: 'mock-data',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error reading reviews:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch reviews', 
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// NORMALIZATION FUNCTION - Adapt and normalize review data
function normalizeReviews(reviews) {
  return reviews.map((review, index) => ({
    id: review.id || index + 1,
    listingName: review.listingName || 'Unknown Listing',
    guestName: review.guestName || 'Anonymous',
    rating: review.rating || calculateAverageRating(review.reviewCategory),
    publicReview: review.publicReview || '',
    reviewCategory: review.reviewCategory || [],
    submittedAt: review.submittedAt || new Date().toISOString(),
    channel: review.channel || 'Hostaway',
    type: review.type || 'guest-to-host',
    status: review.status || 'published',
    approved: review.approved || false
  }));
}

// Stats calculation
function calculateStats(reviews) {
  return {
    total: reviews.length,
    averageRating: calculateOverallAverage(reviews),
    byProperty: groupByProperty(reviews),
    byChannel: groupByChannel(reviews),
    ratingDistribution: getRatingDistribution(reviews)
  };
}

// Helper functions
function calculateAverageRating(categories) {
  if (!categories || categories.length === 0) return 0;
  const sum = categories.reduce((acc, cat) => acc + (cat.rating || 0), 0);
  return Math.round(sum / categories.length);
}

function calculateOverallAverage(reviews) {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / reviews.length).toFixed(2);
}

function groupByProperty(reviews) {
  const grouped = {};
  reviews.forEach(review => {
    if (!grouped[review.listingName]) {
      grouped[review.listingName] = { 
        name: review.listingName, 
        count: 0, 
        totalRating: 0, 
        reviews: [] 
      };
    }
    grouped[review.listingName].count++;
    grouped[review.listingName].totalRating += review.rating;
    grouped[review.listingName].reviews.push(review.id);
  });

  return Object.values(grouped).map(prop => ({
    ...prop,
    averageRating: (prop.totalRating / prop.count).toFixed(2)
  }));
}

function groupByChannel(reviews) {
  const grouped = {};
  reviews.forEach(review => {
    if (!grouped[review.channel]) grouped[review.channel] = 0;
    grouped[review.channel]++;
  });
  return grouped;
}

function getRatingDistribution(reviews) {
  const distribution = { 10: 0, 9: 0, 8: 0, 7: 0, 6: 0, 5: 0, 'below5': 0 };
  reviews.forEach(review => {
    if (review.rating >= 10) distribution[10]++;
    else if (review.rating >= 9) distribution[9]++;
    else if (review.rating >= 8) distribution[8]++;
    else if (review.rating >= 7) distribution[7]++;
    else if (review.rating >= 6) distribution[6]++;
    else if (review.rating >= 5) distribution[5]++;
    else distribution['below5']++;
  });
  return distribution;
}