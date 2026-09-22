import { useEffect } from 'react';
import './LegalPage.css';

const LAST_UPDATED = '4 September 2026';
const SUPPORT_EMAIL = 'stiratechindianlocalstore@gmail.com';
const SUPPORT_PHONE = '+91 96860 68979';

export default function TermsPage() {
  useEffect(() => {
    document.title = 'Terms of Service · Indian Local Store';
  }, []);

  return (
    <div className="page legal-page">
      <div className="container">
        <div className="legal-wrap">
          <header className="legal-header">
            <h1>Terms of Service</h1>
            <p className="legal-updated">Last updated: {LAST_UPDATED}</p>
          </header>

          <p className="legal-intro">
            These terms apply when you use the Indian Local Store website or
            Android app, whether you are buying or selling. By creating an
            account or placing an order you agree to them.
          </p>

          <section className="legal-section">
            <h2>1. What Indian Local Store is</h2>
            <p>
              We are a marketplace. We list local shops and their products and let
              you order from them. The seller you order from is the one who
              supplies the goods, sets the price, and is responsible for the
              quality, quantity, accuracy of description, and lawfulness of what
              they sell. We are not the seller of those goods.
            </p>
          </section>

          <section className="legal-section">
            <h2>2. Your account</h2>
            <ul>
              <li>You must be 18 or older to create an account.</li>
              <li>Give accurate details, and keep your contact number and address up to date so orders can reach you.</li>
              <li>Keep your password private. You are responsible for activity under your account.</li>
              <li>One person should not run multiple accounts to abuse offers or evade a restriction.</li>
              <li>Tell us immediately if you think someone else has accessed your account.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>3. Orders and prices</h2>
            <p>
              Placing an order is an offer to buy. The order is accepted when the
              seller confirms it. Until then we or the seller may decline it —
              for example if the item is out of stock, the price or description
              was wrong, the delivery address is outside the serviceable area, or
              the order looks fraudulent.
            </p>
            <p>
              Prices are shown in Indian Rupees and include applicable taxes
              unless stated otherwise. All amounts payable are calculated on our
              servers from your cart at the moment you place the order. If a
              listed price is obviously incorrect, we may cancel the order and
              tell you why rather than fulfil it at that price.
            </p>
          </section>

          <section className="legal-section">
            <h2>4. Payment</h2>
            <p>
              Orders are currently Cash on Delivery. Please have the exact order
              amount ready when your order arrives and pay the person delivering
              it. Online payment is not available yet; when it is, these terms
              will be updated before it is switched on.
            </p>
            <p>
              Repeatedly refusing to accept or pay for orders you placed may
              result in Cash on Delivery being withdrawn from your account.
            </p>
          </section>

          <section className="legal-section">
            <h2>5. Delivery</h2>
            <p>
              We serve specific local areas. Delivery times are estimates, not
              guarantees, and can be affected by weather, traffic, seller
              availability and address accuracy. Someone should be available at
              the delivery address to receive and pay for the order. If nobody is
              available and we cannot reach you, the order may be returned to the
              seller and cancelled.
            </p>
          </section>

          <section className="legal-section">
            <h2>6. Cancellation, returns and refunds</h2>
            <ul>
              <li>You can cancel from your orders page while the order is still <em>pending</em> or <em>confirmed</em>. Once it is dispatched, cancellation is no longer possible from the app.</li>
              <li>If an item arrives damaged, spoiled, wrong, or short in quantity, contact us within 24 hours of delivery with photographs, and we will arrange a replacement or refund with the seller.</li>
              <li>Fresh produce, prepared food, dairy and other perishable items cannot be returned once accepted, except where they were damaged or spoiled on arrival.</li>
              <li>For Cash on Delivery orders you have not paid for, cancellation simply closes the order. Where a refund is due on a paid order, it will be returned by the same method used to pay.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>7. If you sell on Indian Local Store</h2>
            <ul>
              <li>You confirm you are legally allowed to sell the goods you list, and that you hold any licence or registration your category requires — for example an FSSAI registration for food.</li>
              <li>Your listings must be accurate: correct price, weight or quantity, description, and your own photographs or images you have the right to use.</li>
              <li>Do not list anything prohibited by Indian law, counterfeit goods, or anything you are not authorised to resell.</li>
              <li>Accept, prepare and hand over confirmed orders promptly, and keep your stock and availability current.</li>
              <li>You are responsible for your own tax obligations, including GST where applicable, on your sales.</li>
              <li>We may remove a listing or suspend a shop that breaks these terms or draws repeated, substantiated customer complaints.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>8. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose, or to place orders you do not intend to accept.</li>
              <li>Post reviews that are fake, paid for, abusive, or that impersonate someone else.</li>
              <li>Attempt to access accounts, data or systems that are not yours, or probe, scan or overload our infrastructure.</li>
              <li>Scrape, copy or resell our content, listings or data without written permission.</li>
              <li>Upload anything containing malware, or content that is obscene, hateful or infringes someone else's rights.</li>
            </ul>
          </section>

          <section className="legal-section">
            <h2>9. Content you upload</h2>
            <p>
              You keep ownership of the photographs, descriptions and reviews you
              upload. By uploading them you give us permission to host, display
              and distribute them within the service so it can function — for
              example showing your product photo on the shop page. You confirm
              you have the right to grant this. We may remove content that
              breaches these terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>10. Availability of the service</h2>
            <p>
              We aim to keep the service running but do not promise uninterrupted
              availability. We may suspend it for maintenance, upgrades, or
              because of a failure at a provider we depend on. Features may
              change or be withdrawn.
            </p>
          </section>

          <section className="legal-section">
            <h2>11. Our liability</h2>
            <p>
              Nothing in these terms limits any right you have under the Consumer
              Protection Act, 2019 or other Indian law that cannot be excluded.
            </p>
            <p>
              Subject to that, we are not liable for indirect or consequential
              loss, and our total liability for any claim connected to an order
              is limited to the amount payable for that order. Because the seller
              supplies the goods, claims about the goods themselves lie primarily
              with the seller, though we will help you resolve them.
            </p>
          </section>

          <section className="legal-section">
            <h2>12. Suspension and closure</h2>
            <p>
              You can stop using the service and ask us to close your account at
              any time. We may suspend or close an account that breaches these
              terms, is used fraudulently, or repeatedly harms other users or
              sellers. Where practical we will tell you why.
            </p>
          </section>

          <section className="legal-section">
            <h2>13. Changes to these terms</h2>
            <p>
              We may update these terms. The date at the top shows when they last
              changed. If a change is significant we will make a reasonable
              effort to notify you. Continuing to use the service after a change
              means you accept the updated terms.
            </p>
          </section>

          <section className="legal-section">
            <h2>14. Governing law</h2>
            <p>
              These terms are governed by the laws of India, and the courts of
              India have jurisdiction over any dispute arising from them.
            </p>
          </section>

          <div className="legal-contact">
            <h2>Grievance and support contact</h2>
            <p>For any complaint, order issue or question about these terms:</p>
            <p><strong>Email:</strong> <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
            <p><strong>Phone:</strong> <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}>{SUPPORT_PHONE}</a></p>
            <p>We aim to acknowledge complaints within 48 hours.</p>
          </div>

          <p className="legal-note">
            These terms reflect how the service actually works today. They are not
            legal advice. The Consumer Protection (E-Commerce) Rules, 2020 require
            a marketplace to publish a named Grievance Officer with contact
            details and a stated resolution timeline, and to display seller
            details. Add your registered business name, address and a named
            grievance officer here once your business registration is complete,
            and have a lawyer review this before you scale.
          </p>
        </div>
      </div>
    </div>
  );
}
