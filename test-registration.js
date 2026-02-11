const testRegistration = async () => {
  try {
    const registrationData = {
      name: "Test User",
      email: "test@example.com",
      password: "TestPassword123!",
      department: "IT",
      position: "Developer"
    };

    console.log('Testing registration endpoint...');
    
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    try {
      const result = JSON.parse(responseText);
      console.log('Parsed JSON:', result);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError.message);
      console.log('Raw response that could not be parsed:', responseText);
    }
    
  } catch (error) {
    console.error('Network Error:', error.message);
  }
};

testRegistration();