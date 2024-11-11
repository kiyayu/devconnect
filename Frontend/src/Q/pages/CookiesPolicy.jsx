// CookiesPolicy.jsx
import React from "react";

const CookiesPolicy = () => {
  return (
    <div className="cookies-policy p-6 md:p-12 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Cookies Policy</h1>
      <p>
        This page explains how DevConnect uses cookies and similar technologies.
      </p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">1. What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device to help us provide
          a better user experience. They are commonly used for session
          management and personalized content.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">2. Types of Cookies We Use</h2>
        <ul className="list-disc list-inside ml-4">
          <li>
            Essential Cookies: Required for platform functionality and security.
          </li>
          <li>
            Analytics Cookies: Help us understand how users interact with the
            platform.
          </li>
          <li>Functional Cookies: Allow us to remember user preferences.</li>
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">3. Managing Cookies</h2>
        <p>
          You may control cookies through your browser settings. Disabling
          cookies may impact your experience on DevConnect.
        </p>
      </section>
    </div>
  );
};

export default CookiesPolicy;
