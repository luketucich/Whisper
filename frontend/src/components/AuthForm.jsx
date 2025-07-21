import { useState } from "react";
import { RegisterOrLogin } from "../../wailsjs/go/main/App";

function AuthForm() {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanedPhone = phone.replace(/\D/g, "");

    if (cleanedPhone.length < 10 || cleanedPhone.length > 15) {
      setMessage("Please enter a valid phone number (10–15 digits).");
      return;
    }

    try {
      const user = await RegisterOrLogin(cleanedPhone);
      setMessage(`✅ Welcome, user ID: ${user.id}`);
    } catch (err) {
      setMessage(`❌ Error: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <p className="prompt">Enter your phone number to continue:</p>
      <input
        type="text"
        placeholder="Phone number"
        value={phone}
        maxLength={15}
        onChange={(e) => {
          const value = e.target.value;
          if (/^\d*$/.test(value)) {
            setPhone(value);
          }
        }}
        className="phone-input"
      />
      <button type="submit" className="submit-button">
        Continue
      </button>
      {message && <p className="message">{message}</p>}
    </form>
  );
}

export default AuthForm;
