import { ArrowRight, AlertTriangle,Clock, Dna, Microchip, Users, Sparkles, Globe, Award, Shield, Heart, Target, Star, ChevronRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const SimpleAboutUs = () => {
  const colors = {
    deepPurple: "#2B1B3F",
    antiqueGold: "#C9A24D",
    softIvory: "#F5F3EB",
    lightGold: "#E8D9B0",
    darkPurple: "#1A1129",
  };

  const psychics = [
    { 
      name: "KRS", 
      specialty: "Master Astrologer", 
      color: "bg-[#C9A24D]", 
      bio: "With over 15 years of experience in Vedic astrology, KRS provides profound insights into your life's path.",
      experience: "15+ years",
      rating: 4.9,
      sessions: "2,500+"
    },
    { 
      name: "Arkana", 
      specialty: "Tarot Master", 
      color: "bg-[#C9A24D]", 
      bio: "Master tarot interpreter specializing in career and relationship guidance for elite clientele.",
      experience: "12+ years",
      rating: 4.8,
      sessions: "1,800+"
    },
    { 
      name: "Numeron", 
      specialty: "Numerology Expert", 
      color: "bg-[#C9A24D]", 
      bio: "Renowned numerologist helping VIPs align their lives with cosmic numbers for success.",
      experience: "10+ years",
      rating: 4.9,
      sessions: "2,200+"
    },
    { 
      name: "Amoura", 
      specialty: "Love Specialist", 
      color: "bg-[#C9A24D]", 
      bio: "Intuitive love specialist offering exclusive readings for harmonious relationships.",
      experience: "8+ years",
      rating: 4.7,
      sessions: "1,500+"
    },
  ];

  const testimonials = [
    { 
      quote: "HecateVoyance has transformed my decision-making process. Truly elite service with insights that have guided my business to new heights.", 
      author: "Executive Client", 
      role: "CEO, Fortune 500 Company",
      rating: 5
    },
    { 
      quote: "The insights from their psychics are unparalleled. A must for anyone seeking clarity in both personal and professional matters.", 
      author: "VIP Member", 
      role: "Celebrity Entrepreneur",
      rating: 5
    },
    { 
      quote: "Professional, discreet, and profoundly accurate. The guidance I've received has been instrumental in navigating international negotiations.", 
      author: "High-Profile User", 
      role: "International Diplomat",
      rating: 5
    },
  ];

  const stats = [
    { label: "Years of Excellence", value: "4+", icon: <Award className="h-6 w-6" /> },
    { label: "Satisfied Clients", value: "10,000+", icon: <Users className="h-6 w-6" /> },
    { label: "Sessions Completed", value: "50,000+", icon: <TrendingUp className="h-6 w-6" /> },
    { label: "Accuracy Rating", value: "95%+", icon: <Target className="h-6 w-6" /> },
  ];

  const features = [
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Bank-Level Security",
      description: "Military-grade encryption ensures complete confidentiality for all interactions"
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "24/7 Premium Support",
      description: "Dedicated concierge service for our VIP members, available round the clock"
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Personalized Matching",
      description: "Advanced algorithm connects you with psychics who perfectly match your needs"
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Global Network",
      description: "Access to master psychics from diverse traditions worldwide"
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.softIvory }}>
      {/* Hero Section */}
      <div 
        className="relative py-24 px-4 overflow-hidden"
        style={{ 
          backgroundColor: colors.deepPurple,
          background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.deepPurple} 100%)`
        }}
      >
        <div className="absolute inset-0 opacity-10">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: `${200 + i * 100}px`,
                height: `${200 + i * 100}px`,
                background: `radial-gradient(circle, ${colors.antiqueGold} 0%, transparent 70%)`,
                top: `${20 + i * 30}%`,
                right: `${10 + i * 20}%`,
              }}
            />
          ))}
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full" 
              style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Elite Psychic Guidance Since 2020</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="block" style={{ color: colors.softIvory }}>Welcome to</span>
              <span style={{ 
                background: `linear-gradient(135deg, ${colors.antiqueGold}, #FFD700)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>HecateVoyance</span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{ color: colors.softIvory + "CC" }}>
              Where ancient mystical traditions meet modern sophistication. Experience elite psychic consultations designed for discerning individuals seeking clarity and transformation.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:scale-105 transition-transform"
                style={{ 
                  backgroundColor: colors.antiqueGold,
                  color: colors.deepPurple
                }}
                onClick={() => window.location.href = '/'}
              >
                Talk to Experts
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
            
            </div>
          </motion.div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 px-4" style={{ backgroundColor: colors.lightGold }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-4"
                  style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold mb-2" style={{ color: colors.deepPurple }}>{stat.value}</div>
                <div className="text-sm font-medium" style={{ color: colors.deepPurple + "CC" }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" 
                style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: colors.deepPurple }}>
                Empowering Elite Decision-Making Through Spiritual Insight
              </h2>
              <p className="text-lg leading-relaxed mb-6" style={{ color: colors.deepPurple + "CC" }}>
                At HecateVoyance, we bridge timeless mystical traditions with contemporary sophistication to provide elite, personalized psychic consultations. Drawing inspiration from the ancient goddess Hecate – guardian of crossroads and illumination – we empower high-achievers to navigate life's complexities with confidence and clarity.
              </p>
            </div>
            
            <div className="space-y-6">
              {[
                {
                  icon: <Microchip className="h-6 w-6" />,
                  title: "Cutting-Edge Technology",
                  description: "AI-enhanced analysis combined with ancient wisdom for unparalleled accuracy"
                },
                {
                  icon: <Clock className="h-6 w-6" />,
                  title: "24/7 Premium Access",
                  description: "Exclusive availability ensuring guidance when inspiration strikes"
                },
                {
                  icon: <Dna className="h-6 w-6" />,
                  title: "Scientific Precision",
                  description: "Evidence-based methodologies blended with intuitive spiritual arts"
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "Global Elite Network",
                  description: "Connecting discerning individuals worldwide with master psychics"
                }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg hover:shadow-md transition-shadow"
                  style={{ backgroundColor: colors.softIvory }}>
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
                      {item.icon}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1" style={{ color: colors.deepPurple }}>{item.title}</h3>
                    <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-white rounded-2xl shadow-xl p-8" style={{ border: `2px solid ${colors.antiqueGold}30` }}>
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" 
                  style={{ backgroundColor: colors.deepPurple + "10", color: colors.deepPurple }}>
                  <Sparkles className="h-4 w-4" />
                  <span className="text-sm font-medium">Our Vision</span>
                </div>
                <h3 className="text-2xl font-bold mb-4" style={{ color: colors.deepPurple }}>
                  Redefining Psychic Guidance for the Modern Era
                </h3>
              </div>
              
              <div className="space-y-4">
                <p className="leading-relaxed" style={{ color: colors.deepPurple + "CC" }}>
                  Founded in 2020, HecateVoyance has emerged as the premier destination for VIP psychic services, serving an exclusive clientele of business leaders, celebrities, and visionaries worldwide.
                </p>
                <p className="leading-relaxed" style={{ color: colors.deepPurple + "CC" }}>
                  Our vision extends beyond traditional psychic services. We aim to establish psychic voyance as an essential tool for elite decision-making, fostering a global community of enlightened individuals who harness spiritual insights for extraordinary success in both personal and professional domains.
                </p>
                <p className="leading-relaxed" style={{ color: colors.deepPurple + "CC" }}>
                  We believe in the transformative power of spiritual guidance when delivered with precision, discretion, and profound understanding of modern challenges.
                </p>
              </div>
              
              <div className="mt-8 pt-6 border-t" style={{ borderColor: colors.antiqueGold + "30" }}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2" style={{ borderColor: colors.antiqueGold }}>
                    <img 
                      src="../../public/psychics/profile_img2.jpg" 
                      alt="Founder"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold" style={{ color: colors.deepPurple }}>Founder & Visionary</div>
                    <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>Spiritual Innovator & Tech Entrepreneur</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Problem/Solution Section */}
      <section className="py-20 px-4" style={{ backgroundColor: colors.deepPurple + "05" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepPurple }}>
              Addressing Modern Challenges with Eternal Wisdom
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.deepPurple + "CC" }}>
              In today's complex world, traditional advisory services often fall short. We provide a superior alternative.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white rounded-xl p-8 shadow-lg"
              style={{ border: `2px solid ${colors.antiqueGold}30` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                  style={{ backgroundColor: "#FEE2E2", color: "#DC2626" }}>
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: colors.deepPurple }}>The Modern Dilemma</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Extended wait times for traditional advisory services",
                  "Limited perspectives constrained by conventional methodologies",
                  "Lack of immediate, personalized spiritual guidance",
                  "Generic advice that fails to address unique circumstances"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0" style={{ color: colors.antiqueGold }} />
                    <span style={{ color: colors.deepPurple + "CC" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-8 shadow-lg"
              style={{ border: `2px solid ${colors.antiqueGold}30` }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" 
                  style={{ backgroundColor: "#DCFCE7", color: "#16A34A" }}>
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold" style={{ color: colors.deepPurple }}>Our Revolutionary Solution</h3>
              </div>
              <ul className="space-y-3">
                {[
                  "Immediate access to master psychics 24/7",
                  "AI-enhanced analysis of personal data for precise insights",
                  "Bespoke profiles revealing your true potential",
                  "Actionable advice from diverse spiritual traditions",
                  "Complete confidentiality with bank-level security"
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <ChevronRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0" style={{ color: colors.antiqueGold }} />
                    <span style={{ color: colors.deepPurple + "CC" }}>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          <div className="mt-12 bg-white rounded-xl p-8 shadow-lg" style={{ border: `2px solid ${colors.antiqueGold}` }}>
            <div className="text-center">
              <p className="text-lg font-semibold mb-4" style={{ color: colors.deepPurple }}>
                This is not mere novelty. This is the elevated standard in professional psychic voyance.
              </p>
              <p style={{ color: colors.deepPurple + "CC" }}>
                Our commitment includes rigorous vetting, ongoing professional development, ethical practices, and cultivation of an exclusive community for mutual growth in a secure, private environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Psychics Section */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" 
            style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
            <Users className="h-4 w-4" />
            <span className="text-sm font-medium">Meet Our Experts</span>
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Our Elite Psychic Team
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.deepPurple + "CC" }}>
            Carefully selected master psychics with proven expertise and exceptional client satisfaction records
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {psychics.map((psychic, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2"
                style={{ border: `1px solid ${colors.antiqueGold}30` }}>
                
                <div className="p-6">
                  <div className="flex flex-col items-center mb-6">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-2 mx-auto"
                        style={{ borderColor: colors.antiqueGold }}>
                        <div className={`w-full h-full flex items-center justify-center text-2xl font-bold`}
                          style={{ backgroundColor: colors.antiqueGold, color: colors.deepPurple }}>
                          {psychic.name[0]}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-1" style={{ color: colors.deepPurple }}>{psychic.name}</h3>
                    <p className="text-sm mb-3 px-3 py-1 rounded-full" 
                      style={{ backgroundColor: colors.antiqueGold + "20", color: colors.deepPurple }}>
                      {psychic.specialty}
                    </p>
                    
                    <div className="flex items-center mb-4">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className="h-3 w-3" 
                          style={{ 
                            color: i < Math.floor(psychic.rating) ? colors.antiqueGold : "#E5E7EB",
                            fill: i < Math.floor(psychic.rating) ? colors.antiqueGold : "transparent"
                          }} />
                      ))}
                      <span className="ml-2 text-sm" style={{ color: colors.deepPurple + "CC" }}>
                        {psychic.rating}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-center mb-6" style={{ color: colors.deepPurple + "CC" }}>
                    {psychic.bio}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                      <div className="font-bold" style={{ color: colors.deepPurple }}>{psychic.experience}</div>
                      <div style={{ color: colors.deepPurple + "CC" }}>Experience</div>
                    </div>
                    <div className="p-2 rounded" style={{ backgroundColor: colors.softIvory }}>
                      <div className="font-bold" style={{ color: colors.deepPurple }}>{psychic.sessions}</div>
                      <div style={{ color: colors.deepPurple + "CC" }}>Sessions</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4" style={{ backgroundColor: colors.lightGold }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepPurple }}>
              Premium Features & Benefits
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: colors.deepPurple + "CC" }}>
              Experience the difference with our exclusive services designed for discerning clients
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
                  style={{ backgroundColor: colors.deepPurple, color: colors.softIvory }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: colors.deepPurple }}>{feature.title}</h3>
                <p className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 rounded-full" 
            style={{ backgroundColor: colors.antiqueGold + "20", color: colors.antiqueGold }}>
            <Star className="h-4 w-4" />
            <span className="text-sm font-medium">Client Testimonials</span>
          </div>
          <h2 className="text-3xl font-bold mb-4" style={{ color: colors.deepPurple }}>
            Trusted by Visionary Leaders
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: colors.deepPurple + "CC" }}>
            Hear from distinguished individuals who have transformed their journeys with our guidance
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="bg-white rounded-xl shadow-lg p-8 h-full transition-all duration-300 hover:-translate-y-2"
                style={{ border: `1px solid ${colors.antiqueGold}30` }}>
                
                <div className="flex mb-6">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="h-4 w-4" 
                      style={{ 
                        color: colors.antiqueGold,
                        fill: i < testimonial.rating ? colors.antiqueGold : "transparent"
                      }} />
                  ))}
                </div>
                
                <p className="text-lg italic mb-8 leading-relaxed" style={{ color: colors.deepPurple + "CC" }}>
                  "{testimonial.quote}"
                </p>
                
                <div className="pt-6 border-t" style={{ borderColor: colors.antiqueGold + "30" }}>
                  <div className="font-bold" style={{ color: colors.deepPurple }}>{testimonial.author}</div>
                  <div className="text-sm" style={{ color: colors.deepPurple + "CC" }}>{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4" style={{ 
        backgroundColor: colors.deepPurple,
        background: `linear-gradient(135deg, ${colors.darkPurple} 0%, ${colors.deepPurple} 100%)`
      }}>
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
            style={{ 
              backgroundColor: colors.deepPurple + "DD",
              border: `2px solid ${colors.antiqueGold}`,
              backdropFilter: "blur(10px)"
            }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: colors.softIvory }}>
              Begin Your Transformative Journey
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto" style={{ color: colors.softIvory + "CC" }}>
              Experience elite psychic guidance designed for those who demand excellence in every aspect of life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
                style={{ 
                  backgroundColor: colors.antiqueGold,
                  color: colors.deepPurple
                }}
                onClick={() => window.location.href = '/register'}
              >
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="rounded-full px-8 py-6 text-lg font-semibold hover:scale-105 transition-transform"
                style={{ 
                  borderColor: colors.antiqueGold,
                  color: colors.softIvory
                }}
                onClick={() => window.location.href = '/contact'}
              >
                Schedule a Consultation
              </Button>
            </div>
            
            <p className="text-sm mt-8" style={{ color: colors.softIvory + "80" }}>
              Join thousands of elite clients who trust HecateVoyance for transformative guidance
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default SimpleAboutUs;