import { ScrollText, Users, CreditCard, RotateCcw, AlertTriangle, Shield, Copyright, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function TermsAndConditions() {
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.softIvory }}>
      {/* Hero Section */}
      <div 
        className="relative py-16 px-4 overflow-hidden"
        style={{ 
          backgroundColor: colors.deepPurple,
          background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.deepPurple} 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full" 
            style={{ background: `radial-gradient(circle, ${colors.antiqueGold} 0%, transparent 70%)` }}></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
            <ScrollText className="h-10 w-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: colors.softIvory }}>
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl opacity-90" style={{ color: colors.softIvory }}>
            HecateVoyance - Clear, Transparent, and Professional
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Quick Navigation */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { label: "User Responsibilities", id: "responsibilities" },
              { label: "Payment Terms", id: "payment" },
              { label: "Refund Policy", id: "refund" },
              { label: "Disclaimer", id: "disclaimer" },
              { label: "Intellectual Property", id: "property" }
            ].map((item) => (
              <a 
                key={item.id}
                href={`#${item.id}`}
                className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105"
                style={{ 
                  backgroundColor: colors.antiqueGold + "15",
                  color: colors.deepPurple,
                  border: `1px solid ${colors.antiqueGold}30`
                }}
              >
                {item.label}
                <ChevronRight className="ml-1 h-3 w-3" />
              </a>
            ))}
          </div>
        </div>

        {/* Terms Content */}
        <div className="space-y-8">
          {/* Section 1: User Responsibilities */}
          <section id="responsibilities" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border"
              style={{ borderColor: colors.antiqueGold + "30" }}>
              <div className="p-2" style={{ backgroundColor: colors.deepPurple + "05" }}>
                <div className="flex items-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4"
                    style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.deepPurple }}>User Responsibilities</h2>
                    <p className="text-sm opacity-75" style={{ color: colors.deepPurple }}>
                      Your commitment to ethical use
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <p className="text-gray-700 mb-6">
                  By using HecateVoyance services, you agree to the following responsibilities:
                </p>
                <ul className="space-y-4">
                  {[
                    "Providing accurate and truthful information for personal spiritual analysis.",
                    "Respecting our psychics and adhering to community guidelines at all times.",
                    "Avoiding service misuse for unethical or illegal purposes.",
                    "Maintaining the confidentiality of your account credentials.",
                    "Using our services responsibly and in accordance with all applicable laws."
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 mt-1 mr-3">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: colors.antiqueGold, color: colors.deepPurple }}>
                          {index + 1}
                        </div>
                      </div>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 p-4 rounded-lg" 
                  style={{ backgroundColor: colors.antiqueGold + "10", borderLeft: `4px solid ${colors.antiqueGold}` }}>
                  <p className="font-medium" style={{ color: colors.deepPurple }}>
                    You are solely responsible for any insights or decisions made based on psychic guidance received through our platform.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Payment Terms */}
          <section id="payment" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border"
              style={{ borderColor: colors.antiqueGold + "30" }}>
              <div className="p-2" style={{ backgroundColor: colors.deepPurple + "05" }}>
                <div className="flex items-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4"
                    style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                    <CreditCard className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.deepPurple }}>Payment Terms</h2>
                    <p className="text-sm opacity-75" style={{ color: colors.deepPurple }}>
                      Transparent pricing and billing
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-4 text-gray-700">
                  <p>HecateVoyance operates on a credit-based system and/or subscription model.</p>
                  
                  <div className="grid md:grid-cols-2 gap-6 my-6">
                    <div className="p-4 rounded-lg border" style={{ borderColor: colors.antiqueGold + "30" }}>
                      <h3 className="font-bold mb-2 text-lg" style={{ color: colors.deepPurple }}>Credit System</h3>
                      <p>Purchase credits for specific consultations (e.g., <span className="font-semibold">$3.99/min for chat sessions</span>).</p>
                    </div>
                    <div className="p-4 rounded-lg border" style={{ borderColor: colors.antiqueGold + "30" }}>
                      <h3 className="font-bold mb-2 text-lg" style={{ color: colors.deepPurple }}>Subscription Plans</h3>
                      <p>Monthly packages for premium features and discounted rates.</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Important Notes:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: colors.antiqueGold }} />
                        All prices are clearly displayed before payment confirmation
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: colors.antiqueGold }} />
                        Rates may vary based on psychic expertise and service type
                      </li>
                      <li className="flex items-start">
                        <ChevronRight className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" style={{ color: colors.antiqueGold }} />
                        You will be notified of any price changes 30 days in advance
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Refund Policy */}
          <section id="refund" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border"
              style={{ borderColor: colors.antiqueGold + "30" }}>
              <div className="p-2" style={{ backgroundColor: colors.deepPurple + "05" }}>
                <div className="flex items-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4"
                    style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                    <RotateCcw className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.deepPurple }}>Refund Policy</h2>
                    <p className="text-sm opacity-75" style={{ color: colors.deepPurple }}>
                      Our commitment to fair service
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-6 text-gray-700">
                  <p>Due to the digital and immediate nature of our services:</p>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#FEF2F2", borderLeft: `4px solid #DC2626` }}>
                    <p className="font-semibold text-red-700">
                      All sales are final. No refunds will be issued for completed psychic sessions.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#F0F9FF", borderLeft: `4px solid #0EA5E9` }}>
                    <p className="font-medium text-gray-700 mb-2">Technical Issue Resolution:</p>
                    <p>If you experience technical problems (e.g., system errors, not receiving your consultation), contact our support team within 24 hours for assessment and possible compensation.</p>
                    <p className="text-sm mt-2">Support response time: 1-2 business days</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium mb-2">Refund Exceptions:</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></div>
                        No refunds for subjective dissatisfaction with reading outcomes
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0"></div>
                        Refunds may be considered for verified technical failures preventing service delivery
                      </li>
                      <li className="flex items-start">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                        Unused subscription portions may be eligible for pro-rated refunds (case-by-case basis)
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Disclaimer */}
          <section id="disclaimer" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border"
              style={{ borderColor: colors.antiqueGold + "30" }}>
              <div className="p-2" style={{ backgroundColor: colors.deepPurple + "05" }}>
                <div className="flex items-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4"
                    style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.deepPurple }}>Important Disclaimer</h2>
                    <p className="text-sm opacity-75" style={{ color: colors.deepPurple }}>
                      Understanding the nature of our services
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-4 text-gray-700">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: "#FEF3C7", border: `2px solid ${colors.antiqueGold}` }}>
                    <p className="font-bold text-lg text-center mb-2" style={{ color: colors.deepPurple }}>
                      ⚠️ CRITICAL INFORMATION
                    </p>
                    <p className="text-center">
                      Psychic insights provided on HecateVoyance are for spiritual guidance and entertainment purposes only.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: colors.softIvory }}>
                      <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: colors.antiqueGold }} />
                      <div>
                        <p className="font-semibold mb-1">Not Professional Advice</p>
                        <p className="text-sm">
                          Our services are <span className="font-bold">NOT</span> a substitute for professional legal, medical, psychological, or financial advice.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: colors.softIvory }}>
                      <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: colors.antiqueGold }} />
                      <div>
                        <p className="font-semibold mb-1">Personal Judgment Required</p>
                        <p className="text-sm">
                          Users must exercise their own judgment when interpreting readings and making life decisions.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start p-3 rounded-lg" style={{ backgroundColor: colors.softIvory }}>
                      <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" style={{ color: colors.antiqueGold }} />
                      <div>
                        <p className="font-semibold mb-1">For Entertainment Purposes</p>
                        <p className="text-sm">
                          The platform is intended for entertainment and spiritual exploration purposes.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: "#DC2626" }}>
                    <p className="text-red-600 text-center font-medium">
                      HecateVoyance and its psychics are not liable for any decisions, actions, or outcomes resulting from guidance received through our platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5: Intellectual Property */}
          <section id="property" className="scroll-mt-20">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border"
              style={{ borderColor: colors.antiqueGold + "30" }}>
              <div className="p-2" style={{ backgroundColor: colors.deepPurple + "05" }}>
                <div className="flex items-center p-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg mr-4"
                    style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                    <Copyright className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold" style={{ color: colors.deepPurple }}>Intellectual Property</h2>
                    <p className="text-sm opacity-75" style={{ color: colors.deepPurple }}>
                      Protecting our content and your rights
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="space-y-4 text-gray-700">
                  <p>
                    All content on the platform, including but not limited to UI designs, logos, psychic profiles, reading methodologies, and generated insights are protected intellectual property of HecateVoyance.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6 my-6">
                    <div className="p-4 rounded-lg border" style={{ borderColor: colors.antiqueGold + "30" }}>
                      <h3 className="font-bold mb-2" style={{ color: colors.deepPurple }}>What We Protect</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.antiqueGold }} />
                          Platform design and interface
                        </li>
                        <li className="flex items-start">
                          <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.antiqueGold }} />
                          Psychic profiles and branding
                        </li>
                        <li className="flex items-start">
                          <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.antiqueGold }} />
                          Reading methodologies and systems
                        </li>
                        <li className="flex items-start">
                          <Shield className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.antiqueGold }} />
                          Generated content and insights
                        </li>
                      </ul>
                    </div>
                    
                    <div className="p-4 rounded-lg border" style={{ borderColor: colors.antiqueGold + "30" }}>
                      <h3 className="font-bold mb-2" style={{ color: colors.deepPurple }}>Restricted Activities</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></div>
                          Reproducing or copying platform content
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></div>
                          Modifying or creating derivative works
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></div>
                          Distributing or commercializing our content
                        </li>
                        <li className="flex items-start">
                          <div className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></div>
                          Using our branding without permission
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: colors.antiqueGold + "10" }}>
                    <p className="font-medium" style={{ color: colors.deepPurple }}>
                      Any unauthorized use of HecateVoyance intellectual property will result in immediate termination of service and may lead to legal action.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Acceptance Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-lg p-8 border" 
            style={{ borderColor: colors.antiqueGold + "30" }}>
            <h3 className="text-2xl font-bold mb-4" style={{ color: colors.deepPurple }}>
              Agreement Acceptance
            </h3>
            <p className="text-gray-700 mb-6">
              By using HecateVoyance services, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-full px-8"
                style={{ 
                  backgroundColor: colors.antiqueGold,
                  color: colors.deepPurple
                }}
              >
                Back to Top
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="rounded-full px-8"
                style={{ 
                  borderColor: colors.antiqueGold,
                  color: colors.deepPurple
                }}
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t" style={{ borderColor: colors.antiqueGold + "30" }}>
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 rounded-full mr-3" 
              style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
              <Copyright className="h-4 w-4 mx-auto mt-2" />
            </div>
            <h4 className="text-lg font-bold" style={{ color: colors.deepPurple }}>HecateVoyance</h4>
          </div>
          <p className="text-gray-600 mb-2">Last updated: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p className="text-gray-600">© {new Date().getFullYear()} HecateVoyance. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}