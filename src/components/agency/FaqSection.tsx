import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import Reveal from "@/src/components/agency/Reveal";

const faqs = [
  {
    q: "Website বানাতে কতদিন লাগে?",
    a: "প্যাকেজের ধরন অনুযায়ী সাধারণত ৫–১৪ দিনের মধ্যে ডেলিভারি দেওয়া হয়। প্রতিটি সলিউশনের নির্দিষ্ট ডেলিভারি টাইম প্রোডাক্ট পেজে দেখানো আছে।",
  },
  {
    q: "Domain কি আপনারা দেবেন?",
    a: "আমরা domain কিনতে সাহায্য করি ও guide করি, তবে domain-এর খরচ ও renewal সাধারণত প্যাকেজে included নয় — অর্ডারের আগেই এটা পরিষ্কার করে জানানো হয়।",
  },
  {
    q: "Hosting কি included?",
    a: "প্যাকেজ অনুযায়ী নির্ভর করে। কোনো কোনো প্যাকেজে hosting guidance/সেটআপ included, কিন্তু hosting-এর মাসিক/বার্ষিক খরচ আলাদা — কোনো hidden cost নেই।",
  },
  {
    q: "Website-এর পরে আমি নিজে product add করতে পারব?",
    a: "হ্যাঁ। E-commerce ও অন্যান্য প্যাকেজে Admin Dashboard থাকে, যেখান থেকে আপনি নিজেই product, order ইত্যাদি manage করতে পারবেন। আমরা delivery-র সময় training দিয়ে দিই।",
  },
  {
    q: "Facebook Page-এর সাথে website connect করা যাবে?",
    a: "হ্যাঁ, Facebook Page ও Messenger-এর সাথে connect করার ব্যবস্থা করে দেওয়া যায়।",
  },
  {
    q: "bKash/Nagad/SSLCommerz payment কি included?",
    a: "এটি একটি add-on হিসেবে যোগ করা যায়। Basic প্যাকেজে included না থাকলেও, পরে চাইলে যেকোনো সময় যুক্ত করা সম্ভব।",
  },
  {
    q: "Website mobile-এ কাজ করবে?",
    a: "অবশ্যই। প্রতিটি ওয়েবসাইট Mobile, Tablet ও Desktop — সব ডিভাইসের জন্য Responsive করে বানানো হয়।",
  },
  {
    q: "Website delivery পাওয়ার পরে support পাব?",
    a: "হ্যাঁ, প্রতিটি প্যাকেজের সাথে একটি নির্দিষ্ট সময়ের (যেমন ২–৩ মাস) Support included থাকে। এরপরও চাইলে মাসিক ভিত্তিতে সাপোর্ট নেওয়া যায়।",
  },
  {
    q: "পরে নতুন feature যোগ করা যাবে?",
    a: "হ্যাঁ। আপনার ব্যবসা বড় হলে Payment, Inventory, Delivery Integration, Mobile App-এর মতো ফিচার পরে যোগ করা যায়।",
  },
  {
    q: "মাসিক কোনো charge আছে?",
    a: "মূল website-এর জন্য কোনো বাধ্যতামূলক মাসিক চার্জ নেই। শুধু আপনি যদি Domain/Hosting renewal বা Extended Support নিতে চান, তার খরচ আলাদাভাবে জানানো থাকে।",
  },
  {
    q: "আমি website না বুঝলেও কি আপনারা আমাকে শেখাবেন?",
    a: "হ্যাঁ, এটাই আমাদের কাজ। কোনো টেকনিক্যাল জ্ঞান ছাড়াই যেন আপনি আপনার website নিজে চালাতে পারেন, সেভাবে হাতে-কলমে শিখিয়ে দেওয়া হয়।",
  },
  {
    q: "Source code কি পাব?",
    a: "হ্যাঁ, ডেলিভারির পর আপনার website-এর source code আপনাকে দেওয়া হয় — এটি নির্দিষ্ট চুক্তির অংশ হিসেবে প্যাকেজ পেজে উল্লেখ থাকে।",
  },
  {
    q: "Website-এর ownership কার থাকবে?",
    a: "সম্পূর্ণ পেমেন্ট সম্পন্ন হওয়ার পর website, domain ও এর সব content-এর মালিকানা সম্পূর্ণভাবে আপনার।",
  },
  {
    q: "Domain আমার নামে থাকবে?",
    a: "হ্যাঁ। Domain কেনার সময় আপনার তথ্য দিয়ে registration করা হয়, তাই ownership শুরু থেকেই আপনার নামে থাকে।",
  },
  {
    q: "Support শেষ হওয়ার পরে কী হবে?",
    a: "Support period শেষ হলে বাধ্যতামূলক কোনো চার্জ নেই। পরে প্রয়োজন হলে আপনি মাসিক ভিত্তিতে extended support নিতে পারেন — খরচ আগে থেকেই জানানো হবে।",
  },
  {
    q: "Bug হলে কী হবে?",
    a: "Support period-এর মধ্যে কোনো bug/error ধরা পড়লে আমরা বিনামূল্যে ঠিক করে দিই। নতুন feature request বা scope-এর বাইরের কাজ এর আওতায় পড়ে না।",
  },
];

export default function FaqSection() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
      <Reveal className="mx-auto max-w-2xl text-center">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          প্রশ্ন থাকতে পারে? উত্তর এখানে।
        </h2>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">Frequently Asked Questions</p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10 rounded-2xl border border-slate-200 bg-white px-6">
        <Accordion type="single" collapsible>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-sm font-semibold text-slate-900">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-slate-600">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}
