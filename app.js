const express = require('express');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { router } = require('./api/users'); 

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Handle CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS, PATCH');
    return res.status(200).json({});
  }
  next();
});
app.get('/', (req, res) => {
  res.sendFile('public/login.html', { root: __dirname }); });
// Initialize the Google OAuth2 client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Handle Google Sign-In authentication
app.post('/api/google/login', (req, res) => {
  const { credential } = req.body;

  // Verify the credential on the server-side
  client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  })
    .then((ticket) => {
      const { email } = ticket.getPayload();

      // Generate JWT token
      const token = jwt.sign({ email }, process.env.JWT_SECRET);

      // Send the token back to the client
      res.json({ success: true, token });
    })
    .catch((error) => {
      console.log('Error:', error);
      res.json({ success: false, error: 'Google Sign-In failed' });
    });
});

app.use('/api', router);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
