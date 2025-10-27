// Frontend optimization script
const fs = require('fs');
const path = require('path');

function optimizeFrontend() {
  console.log('🎯 Optimizing frontend...');
  
  const frontendPath = path.join(__dirname, '..', 'frontend');
  
  // Update App.tsx for lazy loading
  const appPath = path.join(frontendPath, 'src', 'App.tsx');
  if (fs.existsSync(appPath)) {
    let content = fs.readFileSync(appPath, 'utf8');
    
    // Add lazy imports if not present
    if (!content.includes('React.lazy')) {
      const lazyImports = `
// Lazy load components for better performance
const Dashboard = lazy(() => import('./pages/Dashboard'));
const InvestmentDashboard = lazy(() => import('./pages/InvestmentDashboard'));
const HomePage = lazy(() => import('./pages/HomePage'));
const HowToInvest = lazy(() => import('./pages/HowToInvest'));
`;
      
      content = content.replace(
        "import React from 'react';",
        "import React, { Suspense, lazy } from 'react';" + lazyImports
      );
      
      // Wrap routes in Suspense
      content = content.replace(
        '<Routes>',
        '<Suspense fallback={<div className="loading">Loading...</div>}><Routes>'
      );
      content = content.replace(
        '</Routes>',
        '</Routes></Suspense>'
      );
      
      fs.writeFileSync(appPath, content);
      console.log('✅ Frontend lazy loading added');
    }
  }
  
  // Add performance monitoring
  const indexPath = path.join(frontendPath, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    if (!content.includes('web-vitals')) {
      const performanceScript = `
    <script>
      // Performance monitoring
      if ('performance' in window) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
          }, 0);
        });
      }
    </script>`;
      
      content = content.replace('</head>', performanceScript + '\n</head>');
      fs.writeFileSync(indexPath, content);
      console.log('✅ Performance monitoring added');
    }
  }
  
  console.log('🎉 Frontend optimization completed!');
}

optimizeFrontend();