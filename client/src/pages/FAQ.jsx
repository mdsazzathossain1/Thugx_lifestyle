import { useState } from 'react';
import { HiChevronDown, HiChevronUp, HiShoppingCart, HiCreditCard, HiTruck, HiRefresh, HiUser, HiPhone } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import { FaFacebook } from 'react-icons/fa';

const faqs = [
  {
    category: 'Ordering',
    icon: HiShoppingCart,
    items: [
      {
        q: 'How do I place an order?',
        a: 'Browse the Shop, select your items, add them to your cart, and proceed to checkout. Fill in your delivery details, choose Cash on Delivery, and confirm your order. You will receive an SMS and email confirmation.',
      },
      {
        q: 'Can I cancel my order?',
        a: 'Yes — you can cancel before the order is dispatched. Contact us immediately at 01410649273 or thugxlifestyle6@gmail.com with your order number. Once the item has been handed to the courier, cancellation is no longer possible.',
      },
      {
        q: 'Can I change my delivery address after placing an order?',
        a: 'Yes, if the order has not yet been dispatched. Contact us as soon as possible and we will update the address. We cannot change the address once the product is out for delivery.',
      },
    ],
  },
  {
    category: 'Payment',
    icon: HiCreditCard,
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We currently accept Cash on Delivery (COD) — you pay when the product arrives at your door. We do not require any advance payment.',
      },
      {
        q: 'Is there any extra charge for Cash on Delivery?',
        a: 'No. The delivery charge shown at checkout is all you pay. There are no extra COD fees.',
      },
    ],
  },
  {
    category: 'Shipping & Delivery',
    icon: HiTruck,
    items: [
      {
        q: 'How long does delivery take?',
        a: 'Inside Dhaka: 1–2 business days. Outside Dhaka (major cities): 2–3 business days. Remote areas: 3–5 business days. Business days are Saturday–Thursday, excluding public holidays.',
      },
      {
        q: 'How much is the delivery charge?',
        a: 'Delivery inside Dhaka costs ৳60. Delivery outside Dhaka (nationwide) costs ৳120. The charge is shown at checkout before you confirm.',
      },
      {
        q: 'How do I track my order?',
        a: 'Log in to your account and go to "My Orders". You will see the live status of your order — Pending, Confirmed, Shipped, or Delivered. You can also contact us with your order number for a status update.',
      },
      {
        q: 'Do you ship outside Bangladesh?',
        a: 'Not at this time. We currently ship to all districts within Bangladesh only.',
      },
    ],
  },
  {
    category: 'Returns & Warranty',
    icon: HiRefresh,
    items: [
      {
        q: 'Can I return a product?',
        a: 'Yes — intact, unused products in original packaging can be returned within 3 days of delivery. Hand the item back to our delivery person and pay only the delivery charge. See our full Return Policy for details.',
      },
      {
        q: 'What does the 2-year watch warranty cover?',
        a: 'The warranty covers mechanical defects in the watch movement (machine) — including movement failures, defective crown/hands, and manufacturing defects. It does not cover physical damage (drops, cracks), water damage beyond the stated resistance, or strap/bracelet wear.',
      },
      {
        q: 'How do I claim the watch warranty?',
        a: 'Contact us with your order number and a description or short video of the issue. We will verify the defect and arrange repair or replacement of the movement at no cost to you.',
      },
      {
        q: 'I received a damaged item. What should I do?',
        a: 'Take a photo or video of the package and item immediately — before fully unpacking. Contact us within 24 hours at 01410649273. We will arrange a free replacement or full refund.',
      },
    ],
  },
  {
    category: 'Account',
    icon: HiUser,
    items: [
      {
        q: 'Do I need an account to order?',
        a: 'Yes, a free account is required to place an order. Creating one takes less than a minute. It lets you track orders, save your address, and view order history.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
          a: "Click \u201cForgot Password\u201d on the login page and enter your email address. We\u2019ll send you a reset link. If you don\u2019t see the email, check your spam folder or contact us.",
      },
      {
        q: 'How do I update my profile information?',
        a: 'Log in and go to "My Account". From there you can update your name, phone number, and address.',
      },
    ],
  },
];

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start justify-between py-4 text-left gap-4 group"
      >
        <span className={`text-sm font-medium leading-relaxed transition-colors ${open ? 'text-secondary' : 'text-primary group-hover:text-secondary'}`}>
          {q}
        </span>
        <span className={`flex-shrink-0 mt-0.5 transition-colors ${open ? 'text-secondary' : 'text-gray-400 group-hover:text-secondary'}`}>
          {open ? <HiChevronUp className="w-4 h-4" /> : <HiChevronDown className="w-4 h-4" />}
        </span>
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-600 leading-relaxed pr-8">
          {a}
        </p>
      )}
    </div>
  );
};

const FAQ = () => (
  <div className="bg-gray-50 min-h-screen py-14">
    <div className="container-custom max-w-3xl">

      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-secondary tracking-[0.3em] uppercase text-xs font-semibold mb-2">Help Center</p>
        <h1 className="font-heading text-4xl font-bold text-primary mb-3">Frequently Asked Questions</h1>
        <p className="text-gray-500 text-base">
          Everything you need to know about shopping with Thugx Lifestyle.
        </p>
      </div>

      {/* Quick links */}
      <div className="flex flex-wrap gap-2 justify-center mb-10">
        {faqs.map(({ category, icon: Icon }) => (
          <a
            key={category}
            href={`#${category.replace(/\s+/g, '-').toLowerCase()}`}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-border rounded-full text-xs text-gray-600 hover:border-secondary hover:text-secondary transition-colors shadow-sm"
          >
            <Icon className="w-3.5 h-3.5" />
            {category}
          </a>
        ))}
      </div>

      {/* Categories */}
      <div className="space-y-6">
        {faqs.map(({ category, icon: Icon, items }) => (
          <div
            key={category}
            id={category.replace(/\s+/g, '-').toLowerCase()}
            className="bg-white border border-border rounded-xl shadow-sm overflow-hidden"
          >
            {/* Category Header */}
            <div className="flex items-center gap-3 px-6 pt-5 pb-3 border-b border-border/60">
              <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="font-heading text-base font-semibold text-primary">{category}</h2>
              <span className="ml-auto text-xs text-gray-400">{items.length} questions</span>
            </div>

            {/* Items */}
            <div className="px-6">
              {items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-10 bg-primary text-white rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div>
          <p className="font-heading font-semibold text-lg text-white">Still have a question?</p>
          <p className="text-gray-300 text-sm mt-1">Our team is available Saturday – Thursday, 10 AM – 8 PM.</p>
        </div>
        <div className="flex flex-col sm:items-end gap-1 text-sm">
          <a href="tel:01410649273" className="text-secondary font-bold hover:underline text-base flex items-center gap-1">
            <HiPhone className="w-4 h-4" /> 01410649273
          </a>
          <a href="mailto:thugxlifestyle6@gmail.com" className="text-gray-400 hover:text-secondary transition-colors">
            thugxlifestyle6@gmail.com
          </a>
          <a href="https://web.facebook.com/profile.php?id=61584280311708" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-secondary transition-colors flex items-center gap-1">
            <FaFacebook className="w-3.5 h-3.5" /> ThugX Lifestyle
          </a>
        </div>
      </div>

      {/* Links to other pages */}
      <div className="mt-6 flex flex-wrap gap-3 justify-center text-sm">
        <Link to="/shipping" className="text-gray-400 hover:text-secondary transition-colors underline underline-offset-2">
          Shipping & Delivery
        </Link>
        <span className="text-gray-300">·</span>
        <Link to="/returns" className="text-gray-400 hover:text-secondary transition-colors underline underline-offset-2">
          Return Policy
        </Link>
      </div>

    </div>
  </div>
);

export default FAQ;
