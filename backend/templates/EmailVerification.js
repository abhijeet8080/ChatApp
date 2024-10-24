exports.Verification_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #7800bc;
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              color: #333;
              line-height: 1.8;
          }
          .verification-code {
              display: block;
              margin: 20px 0;
              font-size: 22px;
              color: #7800bc;
              background: #e8f5e9;
              border: 1px dashed #7800bc;
              padding: 10px;
              text-align: center;
              border-radius: 5px;
              font-weight: bold;
              letter-spacing: 2px;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Verify Your Email</div>
          <div class="content">
              <p>Hello {name},</p>
              <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
              <span class="verification-code">{verificationCode}</span>
              <p>If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ChatWave. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>
`;




exports.Welcome_Email_Template = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to ChatWave</title>
      <style>
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background: #ffffff;
              border-radius: 8px;
              box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
              overflow: hidden;
              border: 1px solid #ddd;
          }
          .header {
              background-color: #7800bc; /* Updated color to match chat app theme */
              color: white;
              padding: 20px;
              text-align: center;
              font-size: 26px;
              font-weight: bold;
          }
          .content {
              padding: 25px;
              line-height: 1.8;
          }
          .welcome-message {
              font-size: 18px;
              margin: 20px 0;
          }
          .features {
              margin: 20px 0;
          }
          .features ul {
              padding-left: 20px;
          }
          .features li {
              margin-bottom: 10px;
          }
          .button {
              display: inline-block;
              padding: 12px 25px;
              margin: 20px 0;
              background-color: #7800bc; /* Consistent with header */
              color: white;
              text-decoration: none;
              border-radius: 5px;
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              transition: background-color 0.3s;
          }
          .button:hover {
              background-color: #7800bc;
          }
          .footer {
              background-color: #f4f4f4;
              padding: 15px;
              text-align: center;
              color: #777;
              font-size: 12px;
              border-top: 1px solid #ddd;
          }
          p {
              margin: 0 0 15px;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">Welcome to ChatWave!</div>
          <div class="content">
              <p class="welcome-message">Hello {name},</p>
              <p>We're excited to have you join **ChatWave**, your new favorite place to connect and communicate seamlessly with friends, family, and colleagues.</p>
              
              <div class="features">
                  <p>Here are some features to help you get started:</p>
                  <ul>
                      <li><strong>Instant Messaging:</strong> Send and receive messages in real-time.</li>
                      <li><strong>Group Chats:</strong> Create groups to stay connected with multiple people at once.</li>
                      <li><strong>Media Sharing:</strong> Share photos, videos, and documents effortlessly.</li>
                      <li><strong>Custom Emojis:</strong> Express yourself with a wide range of emojis.</li>
                      <li><strong>Secure Communication:</strong> Your privacy is our top priority with end-to-end encryption.</li>
                  </ul>
              </div>
              
              <a href="{resetUrl}" class="button">Get Started</a>
              
              <p>To make the most out of ChatWave, we recommend setting up your profile and adding contacts:</p>
              <ul>
                  <li>Complete your profile with a photo and bio.</li>
                  <li>Invite friends to join ChatWave.</li>
                  <li>Explore and customize your chat settings.</li>
              </ul>
              
              <p>If you have any questions or need assistance, our support team is here to help. Feel free to reach out at any time.</p>
          </div>
          <div class="footer">
              <p>&copy; ${new Date().getFullYear()} ChatWave. All rights reserved.</p>
              <p>If you didn't create an account with us, please ignore this email or <a href="#" style="color: #7800bc;">contact support</a> if you have concerns.</p>
          </div>
      </div>
  </body>
  </html>
`;
