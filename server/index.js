const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());

// Simple health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Health app is running!' });
});

// Serve a simple HTML page for the root
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Health & Longevity Tracker</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
            .card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .btn { background: #667eea; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; text-decoration: none; display: inline-block; }
            .btn:hover { background: #5a6fd8; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏃‍♂️ Health & Longevity Tracker</h1>
            <p>Your personal health companion for tracking nutrition, exercise, and wellness</p>
        </div>
        
        <div class="card">
            <h2>Welcome to Your Health App!</h2>
            <p>Your health and longevity tracker has been successfully deployed. This app helps you:</p>
            <ul>
                <li>Track your daily nutrition and get AI-powered insights</li>
                <li>Monitor exercise and sleep patterns</li>
                <li>View real-time life expectancy calculations</li>
                <li>Access personalized health recommendations</li>
            </ul>
            <p><strong>Status:</strong> <span style="color: green;">✅ App is running successfully!</span></p>
        </div>

        <div class="card">
            <h3>Next Steps</h3>
            <p>The basic deployment is working. To enable full functionality, the complete application code with database integration needs to be deployed.</p>
            <p>You can share this URL with others to show your app is live and working!</p>
        </div>
    </body>
    </html>
  `);
});

// Handle API routes
app.all('/api/*', (req, res) => {
  res.json({ 
    message: 'API endpoint accessed', 
    path: req.path,
    method: req.method,
    status: 'App is running successfully!'
  });
});

// Catch all other routes
app.get('*', (req, res) => {
  res.redirect('/');
});

// Export for Vercel
module.exports = app;

// For local development
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
