
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const LandingPage = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Contact form submitted:', { name, email });
    setName('');
    setEmail('');
    alert('Thanks for contacting us! We will get back to you soon.');
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-cargomate-900 to-cargomate-700 pb-16 pt-24 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                Modern Logistics <span className="text-cargomate-300">Solution</span> for Your Business
              </h1>
              <p className="text-lg text-gray-300">
                Streamline your deliveries with our efficient and reliable logistics platform.
                Track shipments in real-time and ensure customer satisfaction.
              </p>
              <div className="flex gap-4">
                <Link to="/register">
                  <Button size="lg" variant="cargomate">Get Started</Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img
                src="/delivery-illustration.svg"
                alt="Delivery Illustration"
                className="mx-auto h-auto max-w-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">Why Choose CargoMate?</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Our platform provides everything you need to manage your deliveries efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<TruckIcon />}
              title="Real-Time Tracking"
              description="Track your deliveries in real-time with accurate GPS location data and status updates"
            />
            <FeatureCard
              icon={<ClockIcon />}
              title="Scheduled Deliveries"
              description="Plan ahead with our easy-to-use scheduling system and never miss a delivery window"
            />
            <FeatureCard
              icon={<ChartIcon />}
              title="Analytics Dashboard"
              description="Gain insights into your delivery performance with comprehensive analytics and reports"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Getting started with CargoMate is simple and straightforward
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Create Account"
              description="Sign up and set up your business profile with just a few clicks"
            />
            <StepCard
              number="2"
              title="Schedule Delivery"
              description="Enter pickup and delivery details and select your preferred time slot"
            />
            <StepCard
              number="3"
              title="Track & Manage"
              description="Monitor deliveries in real-time and keep your customers informed"
            />
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-xl bg-white p-6 shadow-xl md:p-10">
            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-gray-900">Get In Touch</h2>
              <p className="text-gray-600">Have questions? We're here to help you get started.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" size="lg" variant="cargomate">
                Send Message
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">What Our Clients Say</h2>
            <p className="mx-auto max-w-3xl text-lg text-gray-600">
              Don't just take our word for it — here's what businesses like yours have to say
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="CargoMate revolutionized our delivery operations. We've reduced delivery times by 30% and improved customer satisfaction."
              author="John Smith"
              company="Tech Solutions Inc."
            />
            <TestimonialCard
              quote="The real-time tracking feature has been a game-changer for our business. Our customers love the transparency."
              author="Sarah Johnson"
              company="Global Retail"
            />
            <TestimonialCard
              quote="The analytics dashboard gives us valuable insights into our delivery performance, helping us optimize our operations."
              author="Michael Chen"
              company="Rapid Logistics"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-300">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">CargoMate</h3>
              <p className="mb-4">Modern logistics solution for businesses of all sizes.</p>
              <div className="flex space-x-4">
                <SocialIcon href="#" aria-label="Twitter">
                  <TwitterIcon />
                </SocialIcon>
                <SocialIcon href="#" aria-label="Facebook">
                  <FacebookIcon />
                </SocialIcon>
                <SocialIcon href="#" aria-label="LinkedIn">
                  <LinkedInIcon />
                </SocialIcon>
                <SocialIcon href="#" aria-label="Instagram">
                  <InstagramIcon />
                </SocialIcon>
              </div>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Services</h3>
              <ul className="space-y-2">
                <FooterLink href="#">Delivery Management</FooterLink>
                <FooterLink href="#">Real-Time Tracking</FooterLink>
                <FooterLink href="#">Analytics</FooterLink>
                <FooterLink href="#">API Integration</FooterLink>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Company</h3>
              <ul className="space-y-2">
                <FooterLink href="#">About Us</FooterLink>
                <FooterLink href="#">Careers</FooterLink>
                <FooterLink href="#">Blog</FooterLink>
                <FooterLink href="#">Contact</FooterLink>
              </ul>
            </div>
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Legal</h3>
              <ul className="space-y-2">
                <FooterLink href="#">Terms of Service</FooterLink>
                <FooterLink href="#">Privacy Policy</FooterLink>
                <FooterLink href="#">Cookies</FooterLink>
                <FooterLink href="#">GDPR</FooterLink>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 text-center text-sm border-t border-gray-800">
            <p>&copy; {new Date().getFullYear()} CargoMate. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Helper components
const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-transform duration-200 hover:transform hover:scale-105">
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cargomate-100 text-cargomate-500">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const StepCard: React.FC<{
  number: string;
  title: string;
  description: string;
}> = ({ number, title, description }) => (
  <div className="flex flex-col items-center text-center">
    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cargomate-500 text-2xl font-bold text-white">
      {number}
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const TestimonialCard: React.FC<{
  quote: string;
  author: string;
  company: string;
}> = ({ quote, author, company }) => (
  <div className="rounded-lg border border-gray-200 bg-white p-6 shadow">
    <div className="mb-4 text-cargomate-500">
      <QuoteIcon />
    </div>
    <p className="mb-6 italic text-gray-700">{quote}</p>
    <div>
      <p className="font-semibold">{author}</p>
      <p className="text-sm text-gray-600">{company}</p>
    </div>
  </div>
);

const SocialIcon: React.FC<React.ComponentPropsWithRef<"a">> = ({ children, ...props }) => (
  <a {...props} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-white transition-colors hover:bg-cargomate-500">
    {children}
  </a>
);

const FooterLink: React.FC<React.ComponentPropsWithRef<"a">> = ({ children, ...props }) => (
  <li>
    <a {...props} className="hover:text-cargomate-300 transition-colors">
      {children}
    </a>
  </li>
);

// Icon components
const TruckIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3"/>
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/>
    <path d="M14 17h1"/>
    <circle cx="7.5" cy="17.5" r="2.5"/>
    <circle cx="17.5" cy="17.5" r="2.5"/>
  </svg>
);

const ClockIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ChartIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <path d="M18 17V9"/>
    <path d="M13 17V5"/>
    <path d="M8 17v-3"/>
  </svg>
);

const QuoteIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
  </svg>
);

const TwitterIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);

const FacebookIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const LinkedInIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect x="2" y="9" width="4" height="12"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

const InstagramIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.5" y2="6.5"/>
  </svg>
);

export default LandingPage;
