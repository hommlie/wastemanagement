import React from "react";
import "./QuoteForm.css";

const QuoteForm = () => {
  return (
    <section className="quote-section-wrapper">
      <div className="quote-container">

        {/* Get Quote Button */}
        <div className="get-quote-heading">
          <button className="get-quote-btn" type="button">Get Quote</button>
        </div>

        {/* Quote Card */}
        <div className="quote-card">
          <form className="quote-form">
            <div className="form-row">
              <input name="name" type="text" className="form-input" placeholder="Full Name" />
              <input name="phone" type="tel" className="form-input" placeholder="Contact Number" />
              <input name="email" type="email" className="form-input" placeholder="Your E-mail" />

              {/* Send button inside same line */}
              <button type="submit" className="submit-btn send-inline">Send</button>
            </div>
          </form>
        </div>

      </div>
    </section>
  );
};

export default QuoteForm;
