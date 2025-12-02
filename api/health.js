// Vercel Serverless Function - Health Check

export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health check
  return res.status(200).json({
    status: 'ok',
    message: 'Bookr API is running on Vercel!',
    timestamp: new Date().toISOString()
  });
}

