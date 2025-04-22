
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-cargomate-600">CargoMate</h1>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-cargomate-500">Home</Link>
            <Link to="#features" className="text-sm font-medium hover:text-cargomate-500">Features</Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-cargomate-500">Pricing</Link>
            <Link to="#contact" className="text-sm font-medium hover:text-cargomate-500">Contact</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button variant="cargomate">Register</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-cargomate-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">
                Fast & Reliable <span className="text-cargomate-600">Cargo Delivery</span> Services
              </h1>
              <p className="text-lg mb-8 text-gray-600">
                Simplify your logistics with CargoMate's smart delivery management system. Track shipments in real-time, manage vendors, and optimize your delivery operations.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/register">
                  <Button size="lg" variant="cargomate">Get Started</Button>
                </Link>
                <Link to="/tracking">
                  <Button size="lg" variant="outline">Track Shipment</Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 md:pl-10">
              <img 
                src="https://img.freepik.com/free-vector/delivery-service-illustrated_23-2148505081.jpg?w=740&t=st=1678892287~exp=1678892887~hmac=5c5db23d53f2c353c8a5a284c963c8d4712d9e0ce63a0e3c7356c8bef598ef38" 
                alt="Delivery Illustration" 
                className="rounded-lg shadow-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Our Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to streamline your delivery operations and provide exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrackIcon />}
              title="Real-time Tracking"
              description="Track all your deliveries in real-time with accurate GPS locations and status updates."
            />
            <FeatureCard 
              icon={<VendorIcon />}
              title="Vendor Management"
              description="Manage multiple vendors, assign deliveries, and monitor their performance."
            />
            <FeatureCard 
              icon={<RouteIcon />}
              title="Route Optimization"
              description="Optimize delivery routes to save time, reduce fuel costs, and improve efficiency."
            />
            <FeatureCard 
              icon={<NotificationIcon />}
              title="Smart Notifications"
              description="Get instant notifications for delivery updates, delays, and successful deliveries."
            />
            <FeatureCard 
              icon={<PaymentIcon />}
              title="Secure Payments"
              description="Process payments securely and maintain a complete history of all transactions."
            />
            <FeatureCard 
              icon={<ReportIcon />}
              title="Analytics & Reports"
              description="Generate detailed reports and analytics to improve your delivery operations."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose a plan that works for your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <PricingCard 
              title="Basic"
              price="$19"
              period="per month"
              description="Great for small businesses just getting started with deliveries"
              features={[
                "Up to 50 deliveries/month",
                "Basic tracking",
                "Email notifications",
                "1 admin user"
              ]}
              buttonText="Get Started"
              buttonLink="/register"
              highlighted={false}
            />
            <PricingCard 
              title="Pro"
              price="$49"
              period="per month"
              description="Perfect for growing businesses with regular delivery needs"
              features={[
                "Up to 200 deliveries/month",
                "Real-time GPS tracking",
                "Email & SMS notifications",
                "Route optimization",
                "3 admin users"
              ]}
              buttonText="Get Started"
              buttonLink="/register"
              highlighted={true}
            />
            <PricingCard 
              title="Enterprise"
              price="$99"
              period="per month"
              description="For large businesses with high-volume delivery operations"
              features={[
                "Unlimited deliveries",
                "Advanced GPS tracking",
                "Priority support",
                "Custom integrations",
                "Advanced analytics",
                "Unlimited users"
              ]}
              buttonText="Contact Sales"
              buttonLink="#contact"
              highlighted={false}
            />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Have questions or need help? Contact our support team
            </p>
          </div>

          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="p-8 bg-cargomate-600 text-white">
                <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <MailIcon className="mr-4 h-6 w-6" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p>support@cargomate.com</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <PhoneIcon className="mr-4 h-6 w-6" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p>+1 (555) 123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <LocationIcon className="mr-4 h-6 w-6" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p>123 Delivery St, Logisticsville</p>
                      <p>CA 90210, USA</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-xl font-bold mb-6">Send us a message</h3>
                <form className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="name">
                      Name
                    </label>
                    <Input id="name" placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="email">
                      Email
                    </label>
                    <Input id="email" type="email" placeholder="your@email.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="message">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="How can we help you?"
                    ></textarea>
                  </div>
                  <Button type="submit" variant="cargomate" className="w-full">
                    Send Message
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">CargoMate</h3>
              <p className="text-gray-400">
                Modern delivery management platform for businesses of all sizes.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">About Us</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Careers</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Blog</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Press</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">Documentation</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">API Status</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Partners</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="#" className="text-gray-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Terms of Service</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">Cookie Policy</Link></li>
                <li><Link to="#" className="text-gray-400 hover:text-white">GDPR</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2023 CargoMate. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="#" className="text-gray-400 hover:text-white">
                <TwitterIcon className="h-6 w-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white">
                <FacebookIcon className="h-6 w-6" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white">
                <InstagramIcon className="h-6 w-6" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link to="#" className="text-gray-400 hover:text-white">
                <LinkedInIcon className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 transition-all hover:shadow-lg">
      <div className="bg-cargomate-50 p-3 rounded-full w-12 h-12 flex items-center justify-center text-cargomate-600 mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

// Pricing Card Component
interface PricingCardProps {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonLink: string;
  highlighted: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ 
  title, 
  price, 
  period, 
  description, 
  features, 
  buttonText, 
  buttonLink, 
  highlighted 
}) => {
  return (
    <div className={`rounded-lg shadow-lg overflow-hidden transition-transform ${
      highlighted ? 'border-2 border-cargomate-500 transform scale-105' : 'border border-gray-200'
    }`}>
      <div className={`p-6 ${highlighted ? 'bg-cargomate-50' : 'bg-white'}`}>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <div className="flex items-baseline mb-4">
          <span className="text-3xl font-bold">{price}</span>
          <span className="text-gray-500 ml-1">{period}</span>
        </div>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link to={buttonLink}>
          <Button 
            variant={highlighted ? "cargomate" : "outline"} 
            className="w-full"
          >
            {buttonText}
          </Button>
        </Link>
      </div>
      <div className="bg-gray-50 p-6">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// Icons
const TrackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 14v-3Z" />
    <path d="M11 12a3 3 0 0 0 0 6 3 3 0 0 0 0-6Z" />
  </svg>
);

const VendorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

const RouteIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const NotificationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const PaymentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const ReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
    <path d="M10 9H8" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export default LandingPage;
