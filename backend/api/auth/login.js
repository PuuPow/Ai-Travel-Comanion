export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body;

  // Simple auth - accept test user or any email with "test" password
  if (email && password && (password === 'test' || password === 'testpass')) {
    return res.status(200).json({
      message: 'Login successful',
      token: 'demo-jwt-token-' + Date.now(),
      user: {
        id: 1,
        email: email,
        name: email.split('@')[0]
      }
    });
  }

  res.status(401).json({ error: 'Invalid credentials' });
}