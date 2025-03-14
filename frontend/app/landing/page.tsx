"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { useLanguage } from "@/components/language-provider";

export default function LandingPage() {
  const { t } = useLanguage();
  const [hoverFeature, setHoverFeature] = useState<number | null>(null);

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
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary animate-pulse" />
            <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Forensics Lab
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/signin"
              className="text-sm hover:text-primary transition-colors"
            >
              Sign In
            </Link>
            <Button
              asChild
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
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
      <section className="py-20 bg-muted/30 relative overflow-hidden">
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
              <Shield className="h-5 w-5 text-primary" />
              <span className="font-medium">Forensics Lab</span>
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
