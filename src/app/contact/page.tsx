import { Metadata } from "next";
import PageTemplate from "@/components/common/PageTemplate";
import { BsEnvelope, BsTelephone, BsChatDots } from "react-icons/bs";

export const metadata: Metadata = {
  title: "Contact Us - StudyLinker",
  description:
    "Get in touch with StudyLinker. Have questions? We're here to help. Contact our support team for assistance.",
  keywords: ["contact studylinker", "support", "help", "customer service"],
};

export default function ContactPage() {
  return (
    <PageTemplate
      title="Contact Us"
      description="Have questions? We're here to help. Get in touch with our support team."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <BsEnvelope className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600">support@studylinker.academy</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <BsChatDots className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600">Available 24/7</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
            <BsTelephone className="w-10 h-10 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600">Coming Soon</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
            Send Us a Message
          </h2>
          <form className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Message
              </label>
              <textarea
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Your message..."
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </PageTemplate>
  );
}

