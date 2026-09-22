import { useEffect } from 'react';
import './LegalPage.css';

const LAST_UPDATED = '4 September 2026';
const SUPPORT_EMAIL = 'stiratechindianlocalstore@gmail.com';
const SUPPORT_PHONE = '+91 96860 68979';

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy · Indian Local Store';
  }, []);

  return (
    <div className="page legal-page">
      <div className="container">
        <div className="legal-wrap">
          <header className="legal-header">
            <h1>Privacy Policy</h1>
            <p className="legal-updated">Last updated: {LAST_UPDATED}</p>
          </header>

          <p className="legal-intro">
            Indian Local Store connects customers with local shops in India. This
            policy explains exactly what we collect, why we collect it, who we
            share it with, and what you can ask us to do with it. It covers both
            our website and our Android app.
          </p>

          <section className="legal-section">
            <h2>1. Information we collect</h2>

            <h3>Information you give us</h3>
            <ul>
              <li><strong>Account details</strong> — your name, email address and mobile number, collected when you register.</li>
              <li><strong>Delivery details</strong> — the address, city, state and pincode you enter at checkout, so your order can reach you.</li>
              <li><strong>Order details</strong> — the items you order, quantities, amounts and order status.</li>
              <li><strong>Shop and product details</strong> — if you register as a seller, your shop name, description, address, contact number and the product information and photographs you upload.</li>
              <li><strong>Reviews</strong> — any rating or written review you choose to post on a shop or product.</li>
            </ul>

            <h3>Information collected automatically or with your permission</h3>
            <ul>
              <li><strong>Approximate location</strong> — only if you grant location permission, and only to show shops near you. We use it to sort and filter results. We do not build a movement history from it.</li>
              <li><strong>Camera and photo library access</strong> — only used when a seller chooses to upload a product image. We do not access your camera or photos at any other time.</li>
              <li><strong>Technical data</strong> — standard server logs kept by our hosting providers, such as IP address, request time and browser or device type. These are used to keep the service running and to investigate errors and abuse.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>2. How we use your information</h2>
            <p>We use your information only for the purposes below:</p>
            <ul>
              <li>To create and secure your account, and to sign you in.</li>
              <li>To verify your mobile number and email address using one-time passwords.</li>
              <li>To place, fulfil, deliver and track your orders, and to let the relevant seller prepare and dispatch them.</li>
              <li>To show you shops and products near your location.</li>
              <li>To contact you about an order, or to respond when you contact our support.</li>
              <li>To detect and prevent fraud, abuse and technical faults.</li>
            </ul>
            <p>
              We do not sell your personal information. We do not share it with
              advertisers or data brokers.
            </p>
          </section>

          <section className="legal-section">
            <h2>3. Who your information is shared with</h2>
            <p>
              We share the minimum necessary information with the following
              parties, and only for the purposes described:
            </p>
            <ul>
              <li><strong>The seller fulfilling your order</strong> — receives your name, delivery address, contact number and the items ordered, so they can prepare and hand over your order.</li>
              <li><strong>Delivery partners</strong> — where a delivery service is used, they receive the pickup and delivery address and contact details needed to complete the delivery.</li>
              <li><strong>Google Firebase</strong> — verifies your mobile number for sign-in. Your number is processed by Google as part of this.</li>
              <li><strong>Brevo</strong> — sends transactional email such as one-time passwords and order updates.</li>
              <li><strong>Cloudinary</strong> — stores and serves product and shop images.</li>
              <li><strong>Render, Vercel and Supabase</strong> — host our application and database.</li>
              <li><strong>Payment gateway</strong> — when online payment becomes available, card and UPI details will be handled directly by the payment gateway. We will not receive or store your full card number, UPI PIN, CVV or bank credentials at any point.</li>
              <li><strong>Legal authorities</strong> — where we are required to disclose information by Indian law, or to protect our rights or someone's safety.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>4. Payments</h2>
            <p>
              Orders are currently fulfilled on a Cash on Delivery basis, so no
              payment credentials are collected on our website or app. If and
              when online payment is enabled, it will be processed by a
              PCI-DSS-compliant payment gateway. We would receive only a
              transaction reference and its status, never your card or UPI
              credentials.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. How long we keep it</h2>
            <p>
              Account information is kept while your account exists. Order records
              are kept for as long as needed for delivery, support, dispute
              resolution, accounting and tax purposes. Server logs are retained
              for a short period by our hosting providers. When you ask us to
              delete your account, we remove your personal details and keep only
              what the law requires us to keep, such as transaction records.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Your choices and rights</h2>
            <ul>
              <li><strong>Access and correction</strong> — you can view and edit your name, contact details and address from your profile at any time.</li>
              <li><strong>Location permission</strong> — you can refuse or revoke it in your browser or device settings. The service still works; you will just need to search or browse instead of seeing nearby shops automatically.</li>
              <li><strong>Camera and photo permission</strong> — can be revoked in device settings. Only sellers uploading images need it.</li>
              <li><strong>Deletion</strong> — write to us at the address below and we will delete your account and associated personal data, subject to records we must legally retain.</li>
              <li><strong>Withdrawing consent</strong> — you can stop using the service and request deletion at any time.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. Security</h2>
            <p>
              Traffic to our website, app and API is encrypted in transit using
              HTTPS. Passwords are stored only as salted hashes, never in
              readable form. Access to our production database and hosting
              accounts is restricted. No system is perfectly secure, so please
              use a strong, unique password and tell us promptly if you think
              your account has been accessed by someone else.
            </p>
          </section>

          <section className="legal-section">
            <h2>8. Children</h2>
            <p>
              Indian Local Store is not intended for children under 18. We do not
              knowingly collect personal information from children. If you
              believe a child has given us their information, contact us and we
              will delete it.
            </p>
          </section>

          <section className="legal-section">
            <h2>9. Changes to this policy</h2>
            <p>
              If we change this policy we will update the date at the top of this
              page. Where a change materially affects how we use your
              information, we will make a reasonable effort to notify you
              directly.
            </p>
          </section>

          <div className="legal-contact">
            <h2>Contact us</h2>
            <p>Questions about this policy, or a request about your data:</p>
            <p><strong>Email:</strong> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
            <p><strong>Phone:</strong> <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>{SUPPORT_PHONE}</a></p>
            <p><strong>Operated from:</strong> India</p>
          </div>

          <p className="legal-note">
            This policy describes our actual current practices in plain language.
            It is not legal advice. Before scaling up, or before onboarding a
            payment gateway, have it reviewed against the Digital Personal Data
            Protection Act, 2023 and the Consumer Protection (E-Commerce) Rules,
            2020, and add your registered business name and address once
            registration is complete.
          </p>
        </div>
      </div>
    </div>
  );
}
