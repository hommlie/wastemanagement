import React from "react";
import "./QuoteForm.css";

const QuoteForm = () => {
  return (
    <section className="quote-section-wrapper">
      <div className="quote-container">
        <div className="get-quote-heading">
          <button className="get-quote-btn" type="button">Get Quote</button>
        </div>

        <div className="quote-card">
          <form className="quote-form">
            {/* Row 1: Type & Description */}
            <div className="form-row">
              <select name="type" aria-label="Select Type" className="form-select">
                <option>Select Type</option>
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
              <input name="what" type="text" className="form-input" style={{ gridColumn: 'span 2' }} placeholder="What you want to sell ?" />
            </div>

            {/* Row 2: Personal Info */}
            <div className="form-row">
              <input name="name" type="text" className="form-input" placeholder="Full Name" />
              <input name="phone" type="tel" className="form-input" placeholder="Contact Number" />
              <input name="email" type="email" className="form-input" placeholder="Your E-mail" />
            </div>

            {/* Row 3: Location */}
            <div className="form-row">
              <select name="city" aria-label="Select City" className="form-select">
                <option>Select City</option>
                <option>Mumbai</option>
                <option>Delhi</option>
                <option>Bangalore</option>
                <option>Hyderabad</option>
              </select>
              <input name="address" type="text" className="form-input" style={{ gridColumn: 'span 2' }} placeholder="Enter Your Address" />
            </div>

            {/* Submit Button */}
            <button type="submit" className="submit-btn">Send</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
