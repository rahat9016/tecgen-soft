import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import Reveal from "@/src/components/agency/Reveal";

const faqs = [
  {
    q: "Website live হতে কতদিন লাগে?",
    a: "Order confirm করার পর সাধারণত ১–৩ দিনের মধ্যে আপনার website live হয়ে যায়।",
  },
  {
    q: "মাসিক কত টাকা দিতে হবে?",
    a: "Product অনুযায়ী ৳৮৯৯ থেকে ৳১,২৯৯ পর্যন্ত মাসিক fee — hosting, SSL, updates ও support সহ। কোনো upfront বা setup খরচ নেই।",
  },
  {
    q: "Payment কখন করতে হবে?",
    a: "Website live হওয়ার পর থেকে মাসিক payment শুরু হয় — তার আগে কোনো টাকা দিতে হয় না।",
  },
  {
    q: "Domain কি আপনারা দেবেন?",
    a: "Domain আপনি নিজের নামে কিনবেন, তাই এটি সম্পূর্ণ আপনার। কেনা থেকে website-এ connect করা পর্যন্ত পুরো setup আমরা করে দিই। Domain-এর খরচ ও renewal subscription-এ included নয়।",
  },
  {
    q: "Hosting কি included?",
    a: "হ্যাঁ। Hosting ও SSL মাসিক subscription-এর মধ্যেই included — আলাদা কোনো hosting খরচ নেই।",
  },
  {
    q: "Website-এর পরে আমি নিজে product add করতে পারব?",
    a: "হ্যাঁ। প্রতিটি product-এ Admin Dashboard থাকে, যেখান থেকে আপনি নিজেই product, order, booking ইত্যাদি manage করতে পারবেন। Setup-এর সময় training দিয়ে দিই।",
  },
  {
    q: "Facebook Page-এর সাথে website connect করা যাবে?",
    a: "হ্যাঁ, Facebook Page ও Messenger-এর সাথে connect করার ব্যবস্থা করে দেওয়া যায়।",
  },
  {
    q: "bKash/Nagad/SSLCommerz payment কি included?",
    a: "এটি একটি add-on হিসেবে যোগ করা যায় — subscription-এ included না থাকলেও, পরে চাইলে যেকোনো সময় যুক্ত করা সম্ভব।",
  },
  {
    q: "Website mobile-এ কাজ করবে?",
    a: "অবশ্যই। প্রতিটি ওয়েবসাইট Mobile, Tablet ও Desktop — সব ডিভাইসের জন্য Responsive করে বানানো।",
  },
  {
    q: "Support কতদিন পাব?",
    a: "যতদিন subscription চালু থাকবে, ততদিন support, updates ও bug fix included — আলাদা কোনো চার্জ নেই।",
  },
  {
    q: "পরে নতুন feature যোগ করা যাবে?",
    a: "হ্যাঁ। আপনার ব্যবসা বড় হলে Payment, Inventory, Delivery Integration, Mobile App-এর মতো ফিচার পরে যোগ করা যায় — খরচ আগে থেকেই জানানো হয়।",
  },
  {
    q: "আমি website না বুঝলেও কি আপনারা আমাকে শেখাবেন?",
    a: "হ্যাঁ, এটাই আমাদের কাজ। কোনো টেকনিক্যাল জ্ঞান ছাড়াই যেন আপনি আপনার website নিজে চালাতে পারেন, সেভাবে হাতে-কলমে শিখিয়ে দেওয়া হয়।",
  },
  {
    q: "Source code কি পাব?",
    a: "না। এটি subscription service — website-এর software, hosting ও updates আমরা maintain করি, তাই source code দেওয়া হয় না। আপনার domain ও content/data সবসময় আপনার।",
  },
  {
    q: "Domain আমার নামে থাকবে?",
    a: "হ্যাঁ। Domain আপনার তথ্য দিয়ে registration করা হয়, তাই ownership শুরু থেকেই আপনার নামে থাকে।",
  },
  {
    q: "Subscription বন্ধ করলে কী হবে?",
    a: "যেকোনো মাসে cancel করতে পারবেন — কোনো minimum সময় নেই। Cancel করলে website offline হয়ে যাবে, তবে domain আপনার থাকবে এবং আপনার content/data export করে দেওয়া হবে।",
  },
  {
    q: "Bug হলে কী হবে?",
    a: "Subscription চলাকালীন যেকোনো bug/error আমরা বিনামূল্যে ঠিক করে দিই। নতুন feature request বা scope-এর বাইরের কাজ এর আওতায় পড়ে না।",
  },
];

export default function FaqSection() {
  return (
    <section id="faq" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 md:py-18 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          প্রশ্ন থাকতে পারে?{" "}
          <span className="bg-linear-to-r from-indigo-300 via-[#8F87FF] to-indigo-400 bg-clip-text text-transparent">
            উত্তর এখানে।
          </span>
        </h2>
        <p className="mt-3 text-base text-neutral-400">Frequently Asked Questions</p>
      </Reveal>

      <div className="mt-8 grid items-start gap-4 sm:mt-10 lg:grid-cols-2 lg:gap-6">
        {[faqs.slice(0, Math.ceil(faqs.length / 2)), faqs.slice(Math.ceil(faqs.length / 2))].map((column, col) => (
          <Reveal
            key={col}
            delay={0.1 + col * 0.05}
            className="glass rounded-2xl px-5 sm:px-7"
          >
            <Accordion type="single" collapsible>
              {column.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q} className="border-white/10 last:border-b-0">
                  <AccordionTrigger className="py-4 text-left sm:py-5 text-base font-semibold text-white hover:text-indigo-300 hover:no-underline data-[state=open]:text-indigo-200 [&>svg]:text-neutral-400">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-bn text-sm leading-relaxed text-neutral-300">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
