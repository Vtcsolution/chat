import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  ArrowRight,
  MessageSquare,
  Shield,
  Users,
  Star,
  CheckCircle,
  ChevronRight,
  Globe,
  Send,
  User,
  MailCheck,
  AlertCircle
} from "lucide-react";
import React, { useState } from "react";
const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/api/messages/contact`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }
      setSuccess("Thank you for your message! We'll get back to you as soon as possible.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  // Color scheme
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };
  // Static contact data
  const contactPoints = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "General Inquiries",
      details: "info@spiritueelchatten.com",
      link: "mailto:info@spiritueelchatten.com",
      description: "For general questions and support"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "VIP Client Support",
      details: "vip@spiritueelchatten.com",
      link: "mailto:vip@spiritueelchatten.com",
      description: "Dedicated support for premium members"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Phone Support",
      details: "+1 (555) 123-4567",
      link: "tel:+15551234567",
      description: "Mon-Fri, 9AM-6PM EST"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Headquarters",
      details: "123 Mystic Avenue, Suite 500",
      description: "New York, NY 10001"
    }
  ];
  const benefits = [
    "24-hour response time guarantee",
    "Complete confidentiality",
    "Expert spiritual guidance",
    "Personalized consultations",
    "Secure communication",
    "Satisfaction guarantee"
  ];
  const faqs = [
    {
      question: "How quickly will I receive a response?",
      answer: "We guarantee a response within 24 hours for all inquiries. VIP members receive priority response within 6 hours."
    },
    {
      question: "Is my information kept confidential?",
      answer: "Absolutely. We adhere to strict privacy policies and all communications are encrypted and confidential."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a satisfaction guarantee. If you're not satisfied with our service, contact us within 7 days for a full refund."
    },
    {
      question: "Can I schedule a live consultation?",
      answer: "Yes, our premium psychics offer live chat, audio, and video consultations. Contact us to schedule an appointment."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and cryptocurrency for your convenience."
    },
    {
      question: "Are your psychics certified?",
      answer: "All our psychics undergo a rigorous vetting process and are certified professionals with years of experience."
    }
  ];
  // Static testimonials
  const testimonials = [
    {
      name: "Sarah M.",
      role: "Premium Member",
      text: "The support team was incredibly helpful and responsive. My psychic reading was life-changing!",
      date: "2 weeks ago"
    },
    {
      name: "Michael R.",
      role: "First-time Client",
      text: "Quick response time and professional service. Will definitely use again.",
      date: "1 month ago"
    },
    {
      name: "Emma L.",
      role: "VIP Member",
      text: "The 24/7 VIP support is amazing. Always there when I need guidance.",
      date: "3 days ago"
    }
  ];
  // Static support hours
  const supportHours = {
    standard: [
      { day: "Monday - Friday", hours: "9AM - 6PM EST" },
      { day: "Saturday", hours: "10AM - 4PM EST" },
      { day: "Sunday", hours: "Emergency Only" }
    ],
    vip: [
      { day: "24/7 Support", hours: "Available Anytime" },
      { day: "Live Chat", hours: "Instant Connection" },
      { day: "Priority Email", hours: "Within 6 hours" }
    ]
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.softIvory }}>
      {/* Hero Section */}
      <div className="relative overflow-hidden" style={{ backgroundColor: colors.deepPurple }}>
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 relative">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mb-4 tracking-tight">
              Connect With Our Spiritual Guides
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Your journey deserves personalized attention. Reach out to our team of experienced psychics and spiritual advisors.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <div className="flex items-center text-white/90 bg-white/10 px-4 py-2 rounded-full">
                <Shield className="h-5 w-5 mr-2" />
                <span className="text-sm">100% Confidential</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/10 px-4 py-2 rounded-full">
                <Clock className="h-5 w-5 mr-2" />
                <span className="text-sm">24h Response Time</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/10 px-4 py-2 rounded-full">
                <Star className="h-5 w-5 mr-2" />
                <span className="text-sm">Premium Support</span>
              </div>
              <div className="flex items-center text-white/90 bg-white/10 px-4 py-2 rounded-full">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Satisfaction Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Contact Info & Features */}
          <div className="lg:col-span-1 space-y-8">
            {/* Contact Information Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border" style={{ borderColor: colors.lightGold, boxShadow: `0 10px 25px ${colors.deepPurple}10` }}>
              <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: colors.deepPurple }}>
                <span className="flex items-center">
                  <Users className="h-6 w-6 mr-2" style={{ color: colors.antiqueGold }} />
                  Contact Information
                </span>
              </h2>
              <div className="space-y-6">
                {contactPoints.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 p-4 rounded-xl transition-all duration-300 hover:shadow-md"
                    style={{
                      backgroundColor: index % 2 === 0 ? colors.softIvory : 'white',
                      border: `1px solid ${colors.lightGold}`
                    }}
                  >
                    <div className="p-3 rounded-lg" style={{ backgroundColor: colors.antiqueGold + "20" }}>
                      <div style={{ color: colors.antiqueGold }}>
                        {point.icon}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg" style={{ color: colors.deepPurple }}>
                        {point.title}
                      </h3>
                      {point.link ? (
                        <a
                          href={point.link}
                          className="block text-sm mt-1 hover:underline font-medium"
                          style={{ color: colors.antiqueGold }}
                        >
                          {point.details}
                        </a>
                      ) : (
                        <p className="text-sm mt-1 font-medium" style={{ color: colors.deepPurple + "CC" }}>
                          {point.details}
                        </p>
                      )}
                      <p className="text-xs mt-1" style={{ color: colors.deepPurple + "80" }}>
                        {point.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Benefits Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border" style={{ borderColor: colors.lightGold, boxShadow: `0 10px 25px ${colors.deepPurple}10` }}>
              <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: colors.deepPurple }}>
                <span className="flex items-center">
                  <CheckCircle className="h-6 w-6 mr-2" style={{ color: colors.antiqueGold }} />
                  Why Choose Us
                </span>
              </h2>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 mt-1 mr-3">
                      <div className="w-2 h-2 rounded-full transform group-hover:scale-125 transition-transform"
                        style={{ backgroundColor: colors.antiqueGold }}></div>
                    </div>
                    <span className="text-sm font-medium group-hover:text-opacity-100 transition-colors"
                      style={{ color: colors.deepPurple + "CC" }}>
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Testimonials Card */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border" style={{ borderColor: colors.lightGold, boxShadow: `0 10px 25px ${colors.deepPurple}10` }}>
              <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: colors.deepPurple }}>
                <span className="flex items-center">
                  <Star className="h-6 w-6 mr-2" style={{ color: colors.antiqueGold }} />
                  Client Testimonials
                </span>
              </h2>
              <div className="space-y-4">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl"
                    style={{ backgroundColor: colors.softIvory }}
                  >
                    <p className="text-sm italic mb-3" style={{ color: colors.deepPurple }}>
                      "{testimonial.text}"
                    </p>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: colors.deepPurple }}>
                          {testimonial.name}
                        </p>
                        <p className="text-xs" style={{ color: colors.antiqueGold }}>
                          {testimonial.role}
                        </p>
                      </div>
                      <p className="text-xs" style={{ color: colors.deepPurple + "80" }}>
                        {testimonial.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Right Column - Contact Form & FAQ */}
          <div className="lg:col-span-2">
            {/* Contact Form Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border mb-8"
              style={{
                borderColor: colors.lightGold,
                boxShadow: `0 10px 25px ${colors.deepPurple}10`
              }}>
              <div className="p-8">
                <div className="mb-8">
                  <h2 className="text-3xl font-serif font-bold mb-3" style={{ color: colors.deepPurple }}>
                    Send Us a Message
                  </h2>
                  <p className="text-lg" style={{ color: colors.deepPurple + "CC" }}>
                    Fill out the form below and our team will get back to you as soon as possible.
                  </p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.deepPurple }}>
                        <span className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Your Name *
                        </span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                        style={{
                          borderColor: colors.antiqueGold + "50",
                          backgroundColor: colors.softIvory,
                          color: colors.deepPurple,
                          borderWidth: '2px'
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: colors.deepPurple }}>
                        <span className="flex items-center">
                          <Mail className="h-4 w-4 mr-1" />
                          Email Address *
                        </span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                        style={{
                          borderColor: colors.antiqueGold + "50",
                          backgroundColor: colors.softIvory,
                          color: colors.deepPurple,
                          borderWidth: '2px'
                        }}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.deepPurple }}>
                      Subject
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all"
                      style={{
                        borderColor: colors.antiqueGold + "50",
                        backgroundColor: colors.softIvory,
                        color: colors.deepPurple,
                        borderWidth: '2px'
                      }}
                      placeholder="What is this regarding?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.deepPurple }}>
                      Your Message *
                    </label>
                    <textarea
                      name="message"
                      rows="6"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border focus:ring-2 focus:outline-none transition-all resize-none"
                      style={{
                        borderColor: colors.antiqueGold + "50",
                        backgroundColor: colors.softIvory,
                        color: colors.deepPurple,
                        borderWidth: '2px'
                      }}
                      placeholder="Please provide details about your inquiry..."
                    ></textarea>
                  </div>
                  {/* Status Messages */}
                  {success && (
                    <div className="p-4 rounded-lg animate-fadeIn"
                      style={{
                        backgroundColor: "#10B98120",
                        border: "1px solid #10B98140"
                      }}>
                      <div className="flex items-center">
                        <MailCheck className="h-5 w-5 mr-2" style={{ color: "#10B981" }} />
                        <p className="text-sm font-medium" style={{ color: "#065F46" }}>
                          {success}
                        </p>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="p-4 rounded-lg animate-fadeIn"
                      style={{
                        backgroundColor: "#FEE2E220",
                        border: "1px solid #FECACA"
                      }}>
                      <div className="flex items-center">
                        <AlertCircle className="h-5 w-5 mr-2" style={{ color: "#DC2626" }} />
                        <p className="text-sm font-medium" style={{ color: "#DC2626" }}>
                          {error}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full group relative flex items-center justify-center py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      style={{
                        backgroundColor: colors.antiqueGold,
                        color: colors.deepPurple
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending Message...
                        </span>
                      ) : (
                        <span className="flex items-center">
                          <Send className="h-5 w-5 mr-2" />
                          Send Message
                          <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
                        </span>
                      )}
                    </button>
                    <p className="text-center text-xs mt-3" style={{ color: colors.deepPurple + "80" }}>
                      * Required fields. By submitting, you agree to our privacy policy and terms of service.
                    </p>
                  </div>
                </form>
              </div>
            </div>
            {/* FAQ Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 border mb-8"
              style={{
                borderColor: colors.lightGold,
                boxShadow: `0 10px 25px ${colors.deepPurple}10`
              }}>
              <h2 className="text-2xl font-serif font-bold mb-6" style={{ color: colors.deepPurple }}>
                <span className="flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2" style={{ color: colors.antiqueGold }} />
                  Frequently Asked Questions
                </span>
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div
                    key={index}
                    className="border-b pb-6 last:border-0 transition-all duration-300 hover:bg-gray-50 -mx-4 px-4 rounded-lg cursor-pointer"
                    style={{ borderColor: colors.lightGold }}
                  >
                    <div className="flex items-center justify-between group">
                      <h3 className="font-semibold text-lg group-hover:underline" style={{ color: colors.deepPurple }}>
                        {faq.question}
                      </h3>
                      <ChevronRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" style={{ color: colors.antiqueGold }} />
                    </div>
                    <p className="text-sm mt-3 pl-2 border-l-4"
                      style={{
                        color: colors.deepPurple + "CC",
                        borderLeftColor: colors.antiqueGold + "50"
                      }}>
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            {/* Support Hours */}
            <div className="bg-gradient-to-r rounded-2xl shadow-xl p-8 overflow-hidden relative mb-8"
              style={{
                background: `linear-gradient(135deg, ${colors.deepPurple} 0%, ${colors.darkPurple} 100%)`,
                boxShadow: `0 10px 25px ${colors.deepPurple}20`
              }}>
              <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent rounded-full"></div>
              </div>
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <Clock className="h-8 w-8 mr-3" style={{ color: colors.antiqueGold }} />
                  <h3 className="text-2xl font-bold text-white">Support Hours</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Standard Support */}
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                    <p className="font-semibold text-lg text-white mb-3">Standard Support</p>
                    <div className="space-y-2">
                      {supportHours.standard.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-white/80">{schedule.day}</span>
                          <span className="text-sm font-medium text-white">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                 
                  {/* VIP Support */}
                  <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm"
                    style={{ border: `1px solid ${colors.antiqueGold}30` }}>
                    <div className="flex items-center mb-3">
                      <Star className="h-4 w-4 mr-2" style={{ color: colors.antiqueGold }} />
                      <p className="font-semibold text-lg text-white">VIP Priority Support</p>
                    </div>
                    <div className="space-y-2">
                      {supportHours.vip.map((schedule, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-white/80">{schedule.day}</span>
                          <span className="text-sm font-medium" style={{ color: colors.antiqueGold }}>
                            {schedule.hours}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* CTA Banner */}
      <div className="mt-12 relative overflow-hidden"
        style={{
          backgroundColor: colors.lightGold,
          borderTop: `1px solid ${colors.antiqueGold}30`,
          borderBottom: `1px solid ${colors.antiqueGold}30`
        }}>
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: colors.deepPurple }}>
              <MessageSquare className="h-8 w-8" style={{ color: colors.antiqueGold }} />
            </div>
            <h3 className="text-2xl md:text-3xl font-serif font-bold mb-3" style={{ color: colors.deepPurple }}>
              Need Immediate Spiritual Guidance?
            </h3>
            <p className="text-lg mb-6 max-w-2xl mx-auto" style={{ color: colors.deepPurple + "CC" }}>
              Our premium psychics are available for live consultations 24/7
            </p>
            <button
              className="inline-flex items-center px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl group"
              style={{
                backgroundColor: colors.deepPurple,
                color: colors.softIvory
              }}
              onClick={() => alert("Live chat feature would connect here in a real application")}
            >
              <MessageSquare className="h-5 w-5 mr-3 group-hover:animate-pulse" />
              Start Live Chat Now
              <ArrowRight className="ml-3 h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
            </button>
            <p className="text-sm mt-4" style={{ color: colors.deepPurple + "80" }}>
              Available 24/7 for premium members • Instant connection • No appointment needed
            </p>
          </div>
        </div>
      </div>
      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
export default ContactPage;