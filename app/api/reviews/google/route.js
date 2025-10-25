// app/api/reviews/google/route.js

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get('placeId');
  
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: 'Google Places API key not configured' },
      { status: 500 }
    );
  }

  if (!placeId) {
    return Response.json(
      { error: 'placeId parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Google Places API - Place Details endpoint
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK') {
      return Response.json(
        { error: `Google API Error: ${data.status}`, message: data.error_message },
        { status: 400 }
      );
    }

    // Transform Google Reviews to match your data structure
    const transformedReviews = data.result.reviews?.map(review => ({
      id: `google-${review.time}`,
      source: 'Google',
      guestName: review.author_name,
      photoUrl: review.profile_photo_url,
      rating: review.rating, // Google uses 1-5 scale
      publicReview: review.text,
      submittedAt: new Date(review.time * 1000).toISOString(),
      approved: false, // New reviews need approval
      channel: 'Google Reviews',
      listingName: data.result.name,
      reviewCategory: [], // Google doesn't provide category breakdown
      position: 'Google User'
    })) || [];

    return Response.json({
      success: true,
      data: transformedReviews,
      metadata: {
        totalReviews: data.result.user_ratings_total,
        averageRating: data.result.rating,
        placeName: data.result.name
      }
    });

  } catch (error) {
    console.error('Google Reviews API Error:', error);
    return Response.json(
      { error: 'Failed to fetch Google reviews', details: error.message },
      { status: 500 }
    );
  }
}

// POST endpoint to find Place ID by property name/address
export async function POST(request) {
  const { propertyName, address } = await request.json();
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!propertyName && !address) {
    return Response.json(
      { error: 'propertyName or address is required' },
      { status: 400 }
    );
  }

  try {
    const query = encodeURIComponent(propertyName || address);
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,name,formatted_address&key=${apiKey}`
    );

    const data = await response.json();

    if (data.status !== 'OK' || !data.candidates.length) {
      return Response.json(
        { error: 'Property not found on Google' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      placeId: data.candidates[0].place_id,
      name: data.candidates[0].name,
      address: data.candidates[0].formatted_address
    });

  } catch (error) {
    console.error('Google Place Search Error:', error);
    return Response.json(
      { error: 'Failed to search for property', details: error.message },
      { status: 500 }
    );
  }
}