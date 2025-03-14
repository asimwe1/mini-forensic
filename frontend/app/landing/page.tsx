"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  Lock,
  Search,
  Database,
  Network,
  FileDigit,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  Target,
  ShieldCheck,
  Menu,
  X,
  Users,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function LandingPage() {
  const { t } = useLanguage();
  const [hoverFeature, setHoverFeature] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const features = [
    {
      icon: Network,
      title: "Network Analysis",
      description:
        "Visualize and analyze network traffic with interactive 3D graphs",
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: Database,
      title: "Memory Forensics",
      description:
        "Examine memory dumps with advanced visualization techniques",
      color: "from-purple-500 to-pink-500",
      gradient: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
    },
    {
      icon: FileDigit,
      title: "File System Analysis",
      description:
        "Explore file systems and recover deleted data with 3D visualization",
      color: "from-orange-500 to-red-500",
      gradient: "bg-gradient-to-br from-orange-500/20 to-red-500/20",
    },
    {
      icon: Search,
      title: "Artifact Detection",
      description:
        "Automatically detect suspicious artifacts and potential threats",
      color: "from-green-500 to-emerald-500",
      gradient: "bg-gradient-to-br from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Lock,
      title: "Secure Analysis",
      description:
        "Perform forensic analysis in a secure, isolated environment",
      color: "from-indigo-500 to-violet-500",
      gradient: "bg-gradient-to-br from-indigo-500/20 to-violet-500/20",
    },
    {
      icon: Shield,
      title: "Comprehensive Reports",
      description:
        "Generate detailed forensic reports with visualizations and findings",
      color: "from-rose-500 to-pink-500",
      gradient: "bg-gradient-to-br from-rose-500/20 to-pink-500/20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-muted/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary animate-pulse" />
                <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Forensics Lab
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("docs")}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Documentation
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-sm hover:text-primary transition-colors"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-sm hover:text-primary transition-colors"
                >
                  Contact
                </button>
              </nav>
          </div>
          <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <span>Already have an account?</span>
                <Link href="/signin" className="text-primary hover:underline">
              Sign In
            </Link>
              </div>
              <Button
                asChild
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
            </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-muted/50 bg-background/95 backdrop-blur-sm"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col gap-4">
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-sm hover:text-primary transition-colors text-left"
                >
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-sm hover:text-primary transition-colors text-left"
                >
                  Pricing
                </button>
                <button
                  onClick={() => scrollToSection("docs")}
                  className="text-sm hover:text-primary transition-colors text-left"
                >
                  Documentation
                </button>
                <button
                  onClick={() => scrollToSection("about")}
                  className="text-sm hover:text-primary transition-colors text-left"
                >
                  About
                </button>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="text-sm hover:text-primary transition-colors text-left"
                >
                  Contact
                </button>
                <div className="pt-4 border-t border-muted/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Already have an account?</span>
                    <Link
                      href="/signin"
                      className="text-primary hover:underline"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="hero" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-br from-primary/30 via-secondary/20 to-accent/30 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[500px] bg-gradient-to-tr from-primary/20 via-secondary/30 to-accent/20 blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Next-Gen Digital Forensics
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                Advanced Digital{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Forensics
                </span>{" "}
                Platform
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                A powerful, intuitive interface for cybersecurity professionals
                to conduct forensic investigations with cutting-edge
                visualization technology.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  asChild
                  className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  <Link href="/signup">
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-primary/20 hover:bg-primary/10"
                >
                  <Link href="/signin">
                    Sign In
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-muted/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="container mx-auto px-4 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Zap className="h-4 w-4" />
              <span className="text-sm font-medium">Powerful Features</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Advanced Forensic Tools</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides a comprehensive suite of tools for digital
              forensics investigations, from network analysis to memory
              forensics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onMouseEnter={() => setHoverFeature(index)}
                onMouseLeave={() => setHoverFeature(null)}
              >
                <Card
                  className={`h-full transition-all duration-300 border-0 ${
                    hoverFeature === index ? "shadow-xl" : "shadow-lg"
                  } ${feature.gradient}`}
                >
                  <CardContent className="pt-6">
                    <div
                      className={`rounded-full w-12 h-12 flex items-center justify-center mb-4 ${
                        hoverFeature === index ? "scale-110" : ""
                      } transition-transform duration-300`}
                    >
                      <feature.icon
                        className={`h-6 w-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`}
                      />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Section */}
      <section id="docs" className="py-20 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <FileDigit className="h-4 w-4" />
              <span className="text-sm font-medium">Documentation</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Getting Started</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn how to use our platform effectively with our comprehensive
              documentation
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Quick Start Guide",
                description: "Get up and running with our platform in minutes",
                icon: Sparkles,
                link: "/docs/quick-start",
              },
              {
                title: "Network Analysis",
                description:
                  "Learn how to analyze network traffic and visualize connections",
                icon: Network,
                link: "/docs/network-analysis",
              },
              {
                title: "Memory Forensics",
                description:
                  "Master memory dump analysis and visualization techniques",
                icon: Database,
                link: "/docs/memory-forensics",
              },
              {
                title: "File System Analysis",
                description: "Explore file systems and recover deleted data",
                icon: FileDigit,
                link: "/docs/file-system",
              },
              {
                title: "API Reference",
                description:
                  "Complete API documentation for custom integrations",
                icon: ExternalLink,
                link: "/docs/api",
              },
              {
                title: "Best Practices",
                description:
                  "Learn industry best practices for digital forensics",
                icon: ShieldCheck,
                link: "/docs/best-practices",
              },
            ].map((doc, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full border-0 bg-gradient-to-br from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="rounded-full w-12 h-12 flex items-center justify-center mb-4 bg-primary/10">
                      <doc.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{doc.title}</h3>
                    <p className="text-muted-foreground mb-4">
                      {doc.description}
                    </p>
                    <Button variant="ghost" asChild className="p-0 h-auto">
                      <Link
                        href={doc.link}
                        className="text-primary hover:text-primary/80"
                      >
                        Learn more{" "}
                        <ChevronRight className="ml-2 h-4 w-4 inline" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-medium">About Us</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Our Story</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Learn about our mission to revolutionize digital forensics
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-muted-foreground mb-6">
                At Forensics Lab, we're dedicated to revolutionizing digital
                forensics through innovative visualization and analysis tools.
                Our platform combines cutting-edge technology with intuitive
                design to make complex forensic investigations more accessible
                and efficient.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/10">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Innovation First</h4>
                    <p className="text-sm text-muted-foreground">
                      We constantly push the boundaries of what's possible in
                      digital forensics.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/10">
                    <Shield className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Security Focused</h4>
                    <p className="text-sm text-muted-foreground">
                      Security is at the core of everything we do, ensuring your
                      investigations are protected.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full w-8 h-8 flex items-center justify-center bg-primary/10">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Community Driven</h4>
                    <p className="text-sm text-muted-foreground">
                      We work closely with the forensics community to build
                      tools that matter.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-3xl"></div>
              <div className="relative bg-background/50 backdrop-blur-sm rounded-2xl p-8 border border-primary/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      1000+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Active Users
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      50+
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Countries
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      99.9%
                    </div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary mb-1">
                      24/7
                    </div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="py-20 bg-muted/30 relative overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Our Team</span>
            </div>
            <h2 className="text-3xl font-bold mb-4">Meet the Experts</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The talented team behind Forensics Lab
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Chen",
                role: "Founder & CEO",
                bio: "Former FBI digital forensics specialist with 15+ years of experience in cybersecurity.",
                image: "/team/sarah.jpg",
                gradient: "from-blue-500/20 to-cyan-500/20",
              },
              {
                name: "Michael Rodriguez",
                role: "Lead Developer",
                bio: "Full-stack developer specializing in 3D visualization and real-time data processing.",
                image: "/team/michael.jpg",
                gradient: "from-purple-500/20 to-pink-500/20",
              },
              {
                name: "Dr. Emily Watson",
                role: "Security Director",
                bio: "PhD in Computer Security with expertise in memory forensics and malware analysis.",
                image: "/team/emily.jpg",
                gradient: "from-orange-500/20 to-red-500/20",
              },
              {
                name: "James Wilson",
                role: "Product Manager",
                bio: "Product strategist with experience in cybersecurity and forensic tools.",
                image: "/team/james.jpg",
                gradient: "from-green-500/20 to-emerald-500/20",
              },
              {
                name: "Lisa Thompson",
                role: "UX Designer",
                bio: "Award-winning designer focused on making complex forensic tools accessible.",
                image: "/team/lisa.jpg",
                gradient: "from-indigo-500/20 to-violet-500/20",
              },
              {
                name: "David Kim",
                role: "Research Lead",
                bio: "Leading research in advanced visualization techniques for digital forensics.",
                image: "/team/david.jpg",
                gradient: "from-rose-500/20 to-pink-500/20",
              },
            ].map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card
                  className={`h-full border-0 ${member.gradient} overflow-hidden`}
                >
                  <CardContent className="pt-6">
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl"></div>
                      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-primary/20">
                        <div className="w-full h-full bg-muted animate-pulse"></div>
                        {/* Add actual image when available */}
                      </div>
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                      <p className="text-primary mb-3">{member.role}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.bio}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Mail className="h-4 w-4" />
              <span className="text-sm font-medium">Get in Touch</span>
            </div>
            <h3 className="text-2xl font-bold mb-4">Want to Join Our Team?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              We're always looking for talented individuals to join our mission
              of revolutionizing digital forensics.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Link href="mailto:careers@forensicslab.com">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <div className="container mx-auto px-4 relative">
          <div className="bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-xl p-8 md:p-12 border border-primary/20">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
                <Target className="h-4 w-4" />
                <span className="text-sm font-medium">Ready to Start?</span>
              </div>
              <h2 className="text-3xl font-bold mb-4">
                Enhance Your Forensic Capabilities
              </h2>
              <p className="text-muted-foreground mb-8">
                Join cybersecurity professionals worldwide who trust our
                platform for their digital forensics needs.
              </p>
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              >
                <Link href="/signup">Get Started Today</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-muted/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="h-5 w-5 text-primary animate-pulse" />
              <span className="font-medium bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                Forensics Lab
              </span>
            </div>
            <div className="flex gap-6">
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Contact
              </Link>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Forensics Lab. All rights
              reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
