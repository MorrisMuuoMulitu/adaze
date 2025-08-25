const fetch = require('node-fetch');

async function testRegister() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'testlogin@example.com',
        password: 'testpassword123',
        firstName: 'Test',
        lastName: 'Login',
        phone: '1234567890',
        location: 'Nairobi',
        userType: 'buyer'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRegister();
