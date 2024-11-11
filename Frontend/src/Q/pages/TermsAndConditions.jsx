// TermsAndConditions.jsx
import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="terms-and-conditions p-6 md:p-12 text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Terms and Conditions</h1>
      <p>
        Thank you for using DevConnect! By using our platform, you agree to
        these terms.
      </p>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">1. User Responsibilities</h2>
        <p>
          Users must respect community guidelines and avoid inappropriate
          content in both chat and Q&A. Misuse of the platform may lead to
          suspension of access.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">2. Content Ownership</h2>
        <p>
          You own the content you share but grant DevConnect a license to
          display it on the platform. We reserve the right to moderate or remove
          content that violates our policies.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">3. Disclaimers</h2>
        <p>
          We do not guarantee the accuracy of Q&A answers. DevConnect is not
          responsible for content shared by users.
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-xl font-semibold">4. Modifications</h2>
        <p>
          We reserve the right to modify these terms at any time. Users will be
          notified of significant changes.
        </p>
      </section>
    </div>
  );
};

export default TermsAndConditions;
