import { HiRefresh, HiShieldCheck, HiExclamation, HiPhone, HiClock } from 'react-icons/hi';

const Section = ({ icon: Icon, title, children, accent }) => (
  <div className={`bg-white border rounded-xl p-6 shadow-sm ${accent ? 'border-secondary/40' : 'border-border'}`}>
    <div className="flex items-center gap-3 mb-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? 'bg-secondary/15' : 'bg-secondary/10'}`}>
        <Icon className="w-5 h-5 text-secondary" />
      </div>
      <h2 className="font-heading text-xl font-semibold text-primary">{title}</h2>
    </div>
    <div className="text-gray-600 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

const Step = ({ n, text }) => (
  <li className="flex gap-3">
    <span className="w-6 h-6 rounded-full bg-secondary/20 text-secondary font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">{n}</span>
    <span>{text}</span>
  </li>
);

const ReturnPolicy = () => (
  <div className="bg-gray-50 min-h-screen py-14">
    <div className="container-custom max-w-3xl">

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs font-semibold mb-2">Policies</p>
        <h1 className="font-heading text-4xl font-bold text-primary mb-3">Return Policy</h1>
        <p className="text-gray-500 text-base">
          Customer satisfaction is our priority. We keep it simple and fair.
        </p>
      </div>

      <div className="space-y-5">

        {/* Return Overview */}
        <Section icon={HiRefresh} title="Return Overview" accent>
          <p>
            We accept returns on <strong>intact, unused products</strong> in their original condition and packaging.
            Returns must be initiated within <strong>3 days</strong> of receiving the product.
          </p>
          <p className="mt-2">
            To return an item, simply hand it back to our delivery person at the time of the next delivery attempt,
            or contact us to arrange a pickup. The customer is responsible for the <strong>delivery charge only</strong> — 
            no restocking fee, no hidden charges.
          </p>
        </Section>

        {/* Eligibility */}
        <Section icon={HiShieldCheck} title="Return Eligibility">
          <p className="font-medium text-gray-700 mb-3">A product is eligible for return if:</p>
          <ul className="space-y-2">
            {[
              'It is in its original, unused condition — unworn, unscratched, unaltered.',
              'All original packaging, tags, pouches, boxes, and accessories are intact.',
              'The return is initiated within 3 days of delivery.',
              'The item is not from the non-returnable list (see below).',
            ].map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>

          <p className="font-medium text-gray-700 mt-4 mb-3">Items that cannot be returned:</p>
          <ul className="space-y-2">
            {[
              'Products that have been worn, used, or show signs of handling.',
              'Items with removed tags, stickers, or tampered packaging.',
              'Products damaged by the customer after delivery.',
              'Custom or personalised orders.',
            ].map((t, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-400 font-bold mt-0.5">✗</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* How to Return */}
        <Section icon={HiClock} title="How to Return — Step by Step">
          <ol className="space-y-2 list-none">
            <Step n={1} text="Contact us within 3 days of receiving the order — call 01410649273 or email thugxlifestyle6@gmail.com." />
            <Step n={2} text="Provide your order number and a brief reason for the return." />
            <Step n={3} text="Pack the item in its original packaging with all accessories." />
            <Step n={4} text="Hand the package to our delivery person (or we will arrange a pickup) and pay only the delivery charge." />
            <Step n={5} text="Once we receive and inspect the item, your refund or exchange will be processed within 2 business days." />
          </ol>
          <p className="mt-3 text-xs text-gray-400">
            * Refunds are issued via the same mobile banking channel used for payment (bKash / Nagad / Rocket).
          </p>
        </Section>

        {/* Warranty */}
        <div className="bg-primary text-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <HiShieldCheck className="w-5 h-5 text-secondary" />
            </div>
            <h2 className="font-heading text-xl font-semibold text-white">2-Year Machine Warranty on Watches</h2>
          </div>
          <div className="text-gray-300 text-sm leading-relaxed space-y-3">
            <p>
              All watches sold by Thugx Lifestyle come with a <strong className="text-white">2-year warranty on the watch movement (machine)</strong>.
              If your watch develops a mechanical fault within 2 years of purchase, we will repair or replace the movement at <strong className="text-white">no charge to you</strong>.
            </p>
            <p className="font-medium text-white mt-2">Warranty covers:</p>
            <ul className="space-y-1">
              {[
                'Mechanical / quartz movement failures',
                'Defective crown, hands, or internal components',
                'Manufacturing defects identified after purchase',
              ].map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-secondary">✓</span><span>{t}</span></li>
              ))}
            </ul>
            <p className="font-medium text-white mt-2">Warranty does NOT cover:</p>
            <ul className="space-y-1">
              {[
                'Physical damage (drops, cracks, dents, scratches)',
                'Water damage beyond the watch\'s stated water resistance',
                'Strap / bracelet wear and tear',
                'Damage from improper use or unauthorised repair attempts',
              ].map((t, i) => (
                <li key={i} className="flex gap-2"><span className="text-red-400">✗</span><span>{t}</span></li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-gray-400">
              To claim warranty, contact us with your order number and a description or video of the issue.
            </p>
          </div>
        </div>

        {/* Damaged on Arrival */}
        <Section icon={HiExclamation} title="Damaged / Wrong Item on Arrival">
          <p>
            If you receive a damaged or incorrect item, please <strong>photograph or video the package before opening it</strong> and 
            contact us within <strong>24 hours</strong> of delivery.
          </p>
          <p className="mt-2">
            We will arrange a free replacement or full refund — delivery charge waived — with no hassle. 
            Proof of damage (photo/video) is required to process the claim.
          </p>
        </Section>

      </div>

      {/* Contact Strip */}
      <div className="mt-10 bg-white border border-border rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="font-heading font-semibold text-lg text-primary">Need to start a return or claim warranty?</p>
          <p className="text-gray-500 text-sm mt-1">Reach out — we respond within a few hours on business days.</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 text-sm">
          <a href="tel:01410649273" className="text-secondary font-bold hover:underline text-base">01410649273</a>
          <a href="mailto:thugxlifestyle6@gmail.com" className="text-gray-500 hover:text-secondary transition-colors">thugxlifestyle6@gmail.com</a>
        </div>
      </div>

    </div>
  </div>
);

export default ReturnPolicy;
