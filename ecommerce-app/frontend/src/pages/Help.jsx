import React from "react";
import "../styles/Help.css";

const Help = () => {
  return (
    <div className="help-container">
      <h2 className="help-title">Help & Support</h2>
      <p className="help-subtext">
        We're here to help! Browse FAQs or submit a support ticket below.
      </p>

      {/* 🔹 FAQ Section */}
      <div className="faq-section">
        <h3>Frequently Asked Questions</h3>
        <ul className="faq-list">
          <li>
            <strong>How do I track my order?</strong>
            <p>
              Go to <b>Profile → My Orders</b> to see real-time order updates.
            </p>
          </li>
          <li>
            <strong>What payment methods are available?</strong>
            <p>
              We currently support Cash, UPI (GPay/PhonePe), Bank Transfer, and Cheque.
            </p>
          </li>
          <li>
            <strong>How do I contact customer support?</strong>
            <p>
              You can call us at <b>+91 9876543210</b> or email{" "}
              <b>support@greensure.in</b>.
            </p>
          </li>
        </ul>
      </div>

      {/* 🔹 Support Ticket Section */}
      <div className="ticket-section">
        <h3>Submit a Support Ticket</h3>
        <form
          className="ticket-form"
          onSubmit={(e) => {
            e.preventDefault();
            alert("✅ Thanks! Your request has been submitted.");
            e.target.reset(); // ✅ JS-friendly reset
          }}
        >
          <input name="subject" placeholder="Subject" required />
          <textarea
            name="message"
            rows={4}
            placeholder="Briefly describe the issue"
            required
          />
          <button type="submit" className="submit-btn">
            Submit Ticket
          </button>
        </form>
      </div>

      {/* 🔹 Contact Info */}
      <div className="contact-support">
        <h3>Need Immediate Assistance?</h3>
        <p>
          📞 <strong>Phone:</strong> +91-9876543210
        </p>
        <p>
          📧 <strong>Email:</strong> support@greensure.in
        </p>
      </div>
    </div>
  );
};

export default Help;
