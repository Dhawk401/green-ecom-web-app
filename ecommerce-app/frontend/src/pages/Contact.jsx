import React from 'react';
import '../styles/Contact.css'; // Assuming you have a CSS file for styles

const Contact = () => {
  return (
    <div className="contact-wrapper">
      <h2 className="contact-title">Contact Us</h2>
      <form className="contact-form">
        <input className="contact-input" placeholder="Your Name" />
        <input className="contact-input" placeholder="Your Email" />
        <textarea className="contact-textarea" placeholder="Your Message" rows={5}></textarea>
        <button className="contact-button">Send Message</button>
      </form>
      <div className="contact-info">
        <p><strong>Email:</strong> support@gromania.in</p>
        <p><strong>Phone:</strong> +91-9876543210</p>
        <p><strong>Address:</strong> Mumbai, India</p>
      </div>
    </div>
  );
};

export default Contact;
