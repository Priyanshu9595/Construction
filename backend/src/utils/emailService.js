export const sendCredentialsEmail = async (email, password, firstName, role) => {
  const apiKey = process.env.API_KEY_FOR_EMAIL;
  if (!apiKey) {
    console.warn('API_KEY_FOR_EMAIL is not set in environment variables. Email will not be sent.');
    return;
  }

  const payload = {
    sender: {
      name: 'Construction System',
      email: 'priyanshuraj9595@gmail.com'
    },
    to: [
      {
        email: email,
        name: firstName || 'User'
      }
    ],
    subject: 'Your Account Credentials',
    htmlContent: `
      <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2 style="color: #2563eb;">Welcome to Construction System</h2>
          <p>Hello ${firstName || 'User'},</p>
          <p>Your account has been successfully created with the role of <strong>${role || 'User'}</strong>.</p>
          <p>Here are your login credentials:</p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; display: inline-block;">
            <p style="margin: 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0 0 0;"><strong>Password:</strong> ${password}</p>
          </div>
          <p style="margin-top: 20px;">Please login and change your password as soon as possible.</p>
          <p>Best regards,<br>The Construction System Team</p>
        </body>
      </html>
    `
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error sending email:', errorData);
    } else {
      console.log(`Credentials email sent successfully to ${email}`);
    }
  } catch (error) {
    console.error('Failed to send credentials email:', error);
  }
};
