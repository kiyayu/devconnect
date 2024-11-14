 // PrivacyPolicy.jsx
import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy p-6 md:p-12 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p>Welcome to DevConnect’s Privacy Policy. We are committed to protecting your data.</p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">1. Data Collection</h2>
        <p>
          We collect data to improve our services, including personal details provided during
          registration, information shared in chat interactions, and content contributed to the Q&A
          section.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">2. Data Usage</h2>
        <p>
          Your data helps us manage your account, ensure secure chat and Q&A usage, and improve
          platform functionality. We do not share personal data without consent unless legally
          required.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">3. User Rights</h2>
        <p>
          You may request access to, correction, or deletion of your personal information at any
          time by contacting us.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">4. Security</h2>
        <p>
          We take data security seriously and implement various safeguards to protect your
          information from unauthorized access or disclosure.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
