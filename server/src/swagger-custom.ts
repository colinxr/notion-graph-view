/**
 * Custom Swagger documentation template
 */
export const SWAGGER_CUSTOM_DOCUMENT = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Notion Graph View API</title>
  <link rel="stylesheet" type="text/css" href="./swagger-ui.css" />
  <link rel="stylesheet" type="text/css" href="./index.css" />
  <link rel="icon" type="image/png" href="./favicon-32x32.png" sizes="32x32" />
  <link rel="icon" type="image/png" href="./favicon-16x16.png" sizes="16x16" />
  <style>
    .topbar-wrapper img {
      height: 40px;
    }
    
    .swagger-ui .topbar {
      background-color: #000;
      padding: 10px 0;
    }
    
    .swagger-ui .info {
      margin: 30px 0;
    }
    
    .swagger-ui .scheme-container {
      margin: 30px 0;
      padding: 20px;
    }
    
    .custom-info-box {
      background-color: #f8f9fa;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 40px;
      border-left: 4px solid #4A90E2;
    }
    
    .custom-info-box h2 {
      color: #4A90E2;
    }
    
    .custom-info-box table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
    }
    
    .custom-info-box table th,
    .custom-info-box table td {
      padding: 8px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    
    .custom-info-box table th {
      background-color: #4A90E2;
      color: white;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  
  <div class="custom-info-box" id="custom-info" style="display: none;">
    <h2>Notion Graph View API</h2>
    <p>This API provides access to Notion databases, pages, and backlinks. It allows you to:</p>
    <ul>
      <li>Retrieve databases and their contents</li>
      <li>Access pages and their properties</li>
      <li>Extract and manage page backlinks</li>
      <li>Synchronize content with Notion</li>
    </ul>
    
    <h3>Authentication</h3>
    <p>All API endpoints require authentication using a JWT token. Include the token in the Authorization header:</p>
    <pre>Authorization: Bearer your_jwt_token</pre>
    
    <h3>Rate Limits</h3>
    <p>API requests are subject to the following rate limits:</p>
    <table>
      <tr>
        <th>Endpoint</th>
        <th>Rate Limit</th>
      </tr>
      <tr>
        <td>GET requests</td>
        <td>60 requests per minute</td>
      </tr>
      <tr>
        <td>POST/PUT/DELETE requests</td>
        <td>30 requests per minute</td>
      </tr>
      <tr>
        <td>Sync operations</td>
        <td>10 requests per minute</td>
      </tr>
    </table>
    
    <h3>Common Response Codes</h3>
    <table>
      <tr>
        <th>Code</th>
        <th>Description</th>
      </tr>
      <tr>
        <td>200</td>
        <td>Success</td>
      </tr>
      <tr>
        <td>401</td>
        <td>Unauthorized - Authentication required</td>
      </tr>
      <tr>
        <td>403</td>
        <td>Forbidden - Subscription required</td>
      </tr>
      <tr>
        <td>404</td>
        <td>Not found - The requested resource does not exist</td>
      </tr>
      <tr>
        <td>429</td>
        <td>Too many requests - Rate limit exceeded</td>
      </tr>
      <tr>
        <td>500</td>
        <td>Server error</td>
      </tr>
    </table>
  </div>

  <script src="./swagger-ui-bundle.js" charset="UTF-8"> </script>
  <script src="./swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
  <script>
    window.onload = function() {
      // Begin Swagger UI initialization
      const ui = SwaggerUIBundle({
        url: "./swagger-json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 3,
      });
      
      // Show our custom info box after UI loads
      setTimeout(function() {
        const infoContainer = document.querySelector('.swagger-ui .information-container .info');
        const customInfo = document.getElementById('custom-info');
        customInfo.style.display = 'block';
        infoContainer.appendChild(customInfo);
      }, 500);
      
      window.ui = ui;
    }
  </script>
</body>
</html>
`; 