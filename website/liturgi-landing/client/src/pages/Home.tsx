import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, Music, ClipboardList, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Skip to main content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      {/* Navigation */}
      <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50" aria-label="Main navigation">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <a href="/" className="text-2xl font-bold text-primary" aria-label="Liturgi home">Liturgi</a>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#product" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Product</a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
            <Button variant="outline" size="sm" asChild>
              <a href="#signin">Sign In</a>
            </Button>
            <Button size="sm" asChild>
              <a href="#get-started">Get Started</a>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main id="main-content">
        <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/20" aria-labelledby="hero-heading">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <h1 id="hero-heading" className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
                    The Modern Operating System for Church Services
                  </h1>
                  <p className="text-xl text-muted-foreground max-w-2xl">
                    Plan worship services, coordinate teams, and manage every detail of Sunday morning—all in one beautiful, purpose-built platform.
                  </p>
                </div>
                <div className="font-serif italic text-2xl text-accent" aria-label="Company tagline">
                  Plan. Serve. Worship. Together.
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="text-base" asChild>
                    <a href="#get-started">
                      Get Started Free
                      <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
                    </a>
                  </Button>
                  <Button size="lg" variant="outline" className="text-base" asChild>
                    <a href="#demo">Schedule a Demo</a>
                  </Button>
                </div>
              </div>
              <div className="relative" role="img" aria-label="Visual representation of organized ministry">
                <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border p-8 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl" aria-hidden="true">🎵</div>
                    <div className="text-lg font-medium text-foreground">Your Ministry, Organized</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background" aria-labelledby="features-heading">
          <div className="container">
            <div className="text-center space-y-4 mb-16">
              <h2 id="features-heading" className="text-3xl md:text-4xl font-bold text-foreground">Everything Your Ministry Needs</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Liturgi brings together service planning, team management, music libraries, and scheduling into one unified workspace.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4" aria-hidden="true">
                    <ClipboardList className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Service Plans</CardTitle>
                  <CardDescription>
                    Build complete orders of worship with drag-and-drop simplicity. Start from templates or create your own flow.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4" aria-hidden="true">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Team Coordination</CardTitle>
                  <CardDescription>
                    Assign roles, schedule volunteers, and keep everyone on the same page. Your people know exactly where to be.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4" aria-hidden="true">
                    <Music className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Song Library</CardTitle>
                  <CardDescription>
                    Maintain your complete music repository with arrangements, keys, and notes. Search instantly and build setlists in seconds.
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card className="border-border hover:border-primary/50 transition-colors">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4" aria-hidden="true">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>Roster Management</CardTitle>
                  <CardDescription>
                    Schedule assignments across services and teams. Visual calendars and automatic reminders keep your ministry running smoothly.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Product Showcase */}
        <section id="product" className="py-20 bg-muted/30" aria-labelledby="product-heading">
          <div className="container">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1" role="img" aria-label="Product showcase placeholder">
                <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="text-5xl" aria-hidden="true">📋</div>
                    <div className="text-sm text-muted-foreground">Product Screenshot Placeholder</div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2 space-y-6">
                <h2 id="product-heading" className="text-3xl md:text-4xl font-bold text-foreground">No More Scattered Spreadsheets</h2>
                <p className="text-lg text-muted-foreground">
                  Say goodbye to lost emails and last-minute confusion. Liturgi brings everything together in one unified workspace designed specifically for church ministry.
                </p>
                <ul className="space-y-3" role="list">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-foreground">Drag-and-drop service planning with templates</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-foreground">Team scheduling with conflict detection</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-foreground">Searchable music library with arrangements</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="text-foreground">Automatic reminders and notifications</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="py-20 bg-background" aria-labelledby="trust-heading">
          <div className="container text-center space-y-6 max-w-3xl mx-auto">
            <h2 id="trust-heading" className="text-3xl md:text-4xl font-bold text-foreground">Built for Churches, By People Who Understand Ministry</h2>
            <p className="text-lg text-muted-foreground">
              We know Sunday morning. We've been worship leaders, volunteers, and tech coordinators. Liturgi is designed around the real rhythms of church life—not generic project management.
            </p>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground" aria-labelledby="cta-heading">
          <div className="container text-center space-y-8">
            <div className="space-y-4">
              <h2 id="cta-heading" className="text-3xl md:text-4xl font-bold">Ready to Transform Your Church Operations?</h2>
              <p className="text-lg text-primary-foreground/90 max-w-2xl mx-auto">
                Join churches already using Liturgi to plan better services and empower their teams.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-base" asChild>
                <a href="#trial">Start Free Trial</a>
              </Button>
              <Button size="lg" variant="outline" className="text-base bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <a href="#demo">Schedule a Demo</a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30 py-12" role="contentinfo">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="text-xl font-bold text-primary">Liturgi</div>
              <p className="text-sm text-muted-foreground">
                The modern platform for church service planning, team coordination, and worship management.
              </p>
            </div>
            <nav aria-label="Product links">
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#updates" className="hover:text-foreground transition-colors">Updates</a></li>
              </ul>
            </nav>
            <nav aria-label="Support links">
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#help" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-foreground transition-colors">Contact</a></li>
                <li><a href="#status" className="hover:text-foreground transition-colors">Status</a></li>
              </ul>
            </nav>
            <nav aria-label="Legal links">
              <h3 className="font-semibold text-foreground mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#privacy" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#terms" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </nav>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 Liturgi. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
