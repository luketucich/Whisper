import { useState } from "react";
import { Send2FACode } from "../../wailsjs/go/main/App";
import TwoFactorForm from "./TwoFactorForm";

const phoneRegex = /^\+\d{10,15}$/;

function AuthForm({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [step, setStep] = useState("input");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!phoneRegex.test(phone)) {
      setMessage("Invalid phone number. Use format: +12345678901");
      return;
    }

    try {
      await Send2FACode(phone);
      setStep("verify");
    } catch (err) {
      setMessage("Failed to send code.");
    }
  };

  if (step === "verify") {
    return (
      <TwoFactorForm
        phone={phone}
        onBack={() => setStep("input")}
        onLogin={onLogin}
      />
    );
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="prompt">Continue with your phone number:</div>

      <input
        className="phone-input"
        type="text"
        placeholder="+12345678901"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        maxLength={16}
        required
      />

      <button type="submit" className="submit-button">
        Continue
      </button>

      {message && <p className="message">{message}</p>}
    </form>
  );
}

export default AuthForm;
