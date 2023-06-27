function login() {
  const email = document.getElementById("username").value;
  const emailError = document.getElementById("email-error"); 
  const loginBtn = document.getElementById("login-btn"); 

  if (!validateEmail(email)) {
    // Invalid email
    emailError.textContent = "Invalid email"; 
    loginBtn.disabled = true; 
    return;
  }

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      // Check if the token is received
      if (data.token) {
        // Store the token in local storage for future use
        localStorage.setItem("token", data.token);
        // Redirect to verify email page
        window.location.href = "/verify-email.html";
      } else {
        console.error("Token not received");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function validateEmail(email) {
  // Simple email validation using regular expression
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


function verifyOtp() {
  const otp = document.getElementById("otp").value;
  const urlParams = new URLSearchParams(window.location.search);
  const email = urlParams.get("email");
  const token = localStorage.getItem("token"); 

  fetch("/api/verify-otp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify({ email, otp }),
  })
    .then((response) => {
      if (response.ok) {
        // OTP is valid
        // Redirect to a success page or perform any other actions
        window.location.href = "/all-users.html";
      } else {
        // Invalid OTP
        return response.json();
      }
    })
    .then((data) => {
      console.log(data);
      // Display error message to the user or perform any other actions
      if (data && data.message) {
        console.error(data.message);
        window.alert("Invalid OTP");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function logout() {
  fetch("/api/logout")
    .then(() => {
      // Redirect to the login page
      window.location.href = "/login.html";
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Initialize Google Sign-In
function initializeGoogleSignin() {
  google.accounts.id.initialize({
    client_id:"876114257473-i1ku4pf9jpgu33cji3vbn5s502149o07.apps.googleusercontent.com", //will update it 
    callback: handleGoogleSigninCallback,
  });

  google.accounts.id.renderButton(
    document.getElementById('google-signin-btn'),
    {
      theme: 'filled_blue',
      size: 'large',
      text: 'Login with Google',
      shape: 'rectangular',
    }
  );
}

// Handle Google Sign-In callback
function handleGoogleSigninCallback(response) {
  const credential = response.credential;

  // Send the credential to the server for verification
  fetch('/api/google/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem('token', data.token);
        window.location.href = '/all-users.html';
      } else {
        console.log('Error:', data.error);
      }
    })
    .catch((error) => {
      console.log('Error:', error);
    });
}
window.onload = initializeGoogleSignin;
