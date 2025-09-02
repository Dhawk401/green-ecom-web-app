import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Signup.css';

const Signup = () => {
  const navigate = useNavigate();

  const handleGoogleSignup = () => {
    alert('Google sign-up not implemented.');
  };

  const handleFacebookSignup = () => {
    alert('Facebook sign-up not implemented.');
  };

  const handleEmailSignupRedirect = () => {
    navigate('/SignupForm'); // You should create this route for email form
  };

  return (
    <div className="signup-modal-bg">
      <div className="signup-modal">
        <form className="signup-form">
          <h2 className="signup-title">Sign up</h2>

          <button className="social-btn google-btn" type="button" onClick={handleGoogleSignup}>
            <i className="fab fa-google"></i> Continue with Google
          </button>

          <button className="social-btn facebook-btn" type="button" onClick={handleFacebookSignup}>
            <i className="fab fa-facebook-f"></i> Continue with Facebook
          </button>

          <button className="social-btn email-btn" type="button" onClick={handleEmailSignupRedirect}>
            <i className="fa-solid fa-envelope"></i> Continue with Email / Phone number
          </button>


          <p className="signup-agreement">
            By signing up, you agree to the <a href="#">Terms of Service</a><br />
            and acknowledge you’ve read our <a href="#">Privacy Policy</a>.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
