import { HiTruck, HiClock, HiLocationMarker, HiShieldCheck, HiCurrencyDollar } from 'react-icons/hi';
import { FaFacebook } from 'react-icons/fa';

const Section = ({ icon: Icon, title, children }) => (
  <div className="bg-white border border-border rounded-xl p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon className="w-5 h-5 text-secondary" />
      </div>
      <h2 className="font-heading text-xl font-semibold text-primary">{title}</h2>
    </div>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between items-center py-3 border-b border-border last:border-0">
    <span className="text-gray-700 font-medium text-sm">{label}</span>
    <span className="text-gray-600 text-sm text-right">{value}</span>
  </div>
);

const ShippingDelivery = () => (
  <div className="bg-gray-50 min-h-screen py-14">
    <div className="container-custom max-w-3xl">

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs font-semibold mb-2">Logistics</p>
        <h1 className="font-heading text-4xl font-bold text-primary mb-3">Shipping &amp; Delivery</h1>
        <p className="text-gray-500 text-base">We deliver across Bangladesh — fast, safe, and reliable.</p>
      </div>

      <div className="space-y-5">

        {/* Delivery Zones & Charges */}
        <Section icon={HiTruck} title="Delivery Zones & Charges">
          <p className="mb-4">We currently ship to all districts across Bangladesh through our trusted courier partners.</p>
          <div className="bg-gray-50 rounded-lg px-4 divide-y divide-border">
            <Row label="Inside Dhaka" value="৳60" />
            <Row label="Outside Dhaka / Rest of Bangladesh" value="৳120" />
            <Row label="Same-day delivery (Dhaka only)" value="Subject to availability — contact us" />
          </div>
          <p className="mt-3 text-xs text-gray-400">
            * Delivery charges are calculated at checkout based on your selected address area.
          </p>
        </Section>

        {/* Delivery Timeline */}
        <Section icon={HiClock} title="Delivery Timeline">
          <div className="bg-gray-50 rounded-lg px-4 divide-y divide-border">
            <Row label="Inside Dhaka" value="1 – 2 business days" />
            <Row label="Outside Dhaka (major cities)" value="2 – 3 business days" />
            <Row label="Remote / rural areas" value="3 – 5 business days" />
          </div>
          <p className="mt-3">
            Delivery timelines begin after <strong>payment confirmation</strong>. Orders placed before 2:00 PM are typically dispatched the same day.
          </p>
          <p className="mt-2 text-xs text-gray-400">
            * Timelines may vary during national holidays, Eid, or adverse weather conditions. We will notify you of any delays.
          </p>
        </Section>

        {/* Order Processing */}
        <Section icon={HiShieldCheck} title="Order Processing">
          <ul className="space-y-2 list-none">
            {[
              'After placing your order, submit your bKash / Nagad / Rocket transaction ID on the payment page.',
              'Our team reviews and confirms payment within a few hours (typically under 4 hours on business days).',
              'Once confirmed, your order is packed and handed to the courier the same or next business day.',
              'You will receive an order status update — you can track live via "Track Order" on the website.',
            ].map((t, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-5 h-5 rounded-full bg-secondary/20 text-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Packaging */}
        <Section icon={HiLocationMarker} title="Packaging & Safety">
          <p>
            Every product is carefully inspected and packed before dispatch. Watches are shipped in protective boxes;
            sunglasses are individually wrapped and secured in padded pouches to prevent any transit damage.
          </p>
          <p className="mt-2">
            If your package arrives visibly damaged, please <strong>photograph it before opening</strong> and contact us
            immediately at <a href="mailto:thugxlifestyle6@gmail.com" className="text-secondary hover:underline">thugxlifestyle6@gmail.com</a>.
          </p>
        </Section>

        {/* COD Note */}
        <Section icon={HiCurrencyDollar} title="Cash on Delivery (COD)">
          <p>
            We offer a flexible payment option — you may pay the <strong>delivery charge only</strong> upfront via mobile banking,
            with the product cost collected by the delivery person upon receipt.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            COD availability depends on area and order value. Contact us at <strong>01410649273</strong> if you'd like to arrange COD for your order.
          </p>
        </Section>

      </div>

      {/* Contact Strip */}
      <div className="mt-10 bg-primary text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-heading font-semibold text-lg">Still have questions?</p>
          <p className="text-gray-300 text-sm mt-1">Our team is happy to help — reach out anytime.</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 text-sm">
          <a href="tel:01410649273" className="text-secondary font-semibold hover:underline">01410649273</a>
          <a href="mailto:thugxlifestyle6@gmail.com" className="text-gray-300 hover:text-secondary transition-colors">thugxlifestyle6@gmail.com</a>
          <a href="https://web.facebook.com/profile.php?id=61584280311708" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-secondary transition-colors flex items-center gap-1">
            <FaFacebook className="w-3.5 h-3.5" /> ThugX Lifestyle
          </a>
        </div>
      </div>

    </div>
  </div>
);

export default ShippingDelivery;
