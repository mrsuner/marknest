import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gradient-to-b from-base-100 to-base-200">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Decorative paper texture background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" 
             style={{
               backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3Cpattern id='paper' width='100' height='100' patternUnits='userSpaceOnUse'%3E%3Crect fill='none'/%3E%3Ccircle cx='20' cy='20' r='0.5' fill='currentColor'/%3E%3Ccircle cx='80' cy='40' r='0.3' fill='currentColor'/%3E%3Ccircle cx='40' cy='80' r='0.4' fill='currentColor'/%3E%3Ccircle cx='90' cy='90' r='0.2' fill='currentColor'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23paper)'/%3E%3C/svg%3E")`
             }}>
        </div>
        
        <div className="text-center max-w-5xl mx-auto relative z-10">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl xl:text-8xl font-light mb-8 tracking-tight">
            <span className="text-base-content">Mark</span>
            <span className="text-primary font-medium">Nest</span>
          </h1>
          
          <p className="text-xl lg:text-2xl mb-12 max-w-3xl mx-auto text-base-content/70 font-light leading-relaxed">
            Your serene digital sanctuary for thoughtful writing. Where ideas flow naturally 
            from mind to markdown with the gentle simplicity of pen on paper.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              href="/signup" 
              className="btn btn-primary btn-lg px-8 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 border-0"
            >
              Begin Your Journey
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link 
              href="/login" 
              className="btn btn-outline btn-lg px-8 text-lg font-medium hover:bg-base-200 transition-all duration-300"
            >
              Welcome Back
            </Link>
          </div>
          
          <div className="text-sm text-base-content/50 font-light">
            Join thousands of writers finding clarity in simplicity
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-6xl font-light mb-6 text-base-content tracking-tight">
              Write Like You <span className="text-primary font-medium">Think</span>
            </h2>
            <p className="text-xl lg:text-2xl text-base-content/60 max-w-3xl mx-auto font-light leading-relaxed">
              Experience the pure joy of writing with tools designed for clarity, focus, and creative flow.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="group">
              <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-lg transition-all duration-500 border border-base-300/50">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium mb-4 text-base-content">Live Preview</h3>
                <p className="text-base-content/70 text-lg leading-relaxed">
                  Watch your thoughts transform into beautiful documents with our seamless dual-pane editor and real-time preview.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="group">
              <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-lg transition-all duration-500 border border-base-300/50">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary/10 to-secondary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium mb-4 text-base-content">Mindful Organization</h3>
                <p className="text-base-content/70 text-lg leading-relaxed">
                  Keep your thoughts organized with intuitive virtual folders and powerful search that feels natural.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="group">
              <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 lg:p-10 shadow-sm hover:shadow-lg transition-all duration-500 border border-base-300/50">
                <div className="w-16 h-16 bg-gradient-to-br from-accent/10 to-accent/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-medium mb-4 text-base-content">Thoughtful Sharing</h3>
                <p className="text-base-content/70 text-lg leading-relaxed">
                  Share your ideas with confidence using secure links, privacy controls, and expiration settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32 bg-gradient-to-br from-base-200 to-base-100">
        <div className="max-w-6xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-6xl font-light mb-6 text-base-content tracking-tight">
              Simple <span className="text-primary font-medium">Pricing</span>
            </h2>
            <p className="text-xl lg:text-2xl text-base-content/60 max-w-3xl mx-auto font-light leading-relaxed">
              Choose the perfect plan for your writing journey. Start free, upgrade when you&apos;re ready to grow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Free Plan */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 shadow-sm border border-base-300/50 relative">
              <div className="text-center">
                <h3 className="text-2xl font-medium text-base-content mb-2">Free</h3>
                <p className="text-base-content/70 mb-6">Perfect for getting started</p>
                <div className="mb-8">
                  <span className="text-4xl font-light text-base-content">Free</span>
                  <span className="text-base-content/60 ml-2">forever</span>
                </div>
                <Link 
                  href="/signup" 
                  className="btn btn-outline w-full mb-8 hover:bg-primary hover:border-primary hover:text-primary-content transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
              <ul className="space-y-4 text-base-content/70">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100 documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>20MB assets storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10 versions per document</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Email support</span>
                </li>
                <li className="flex items-center gap-3 text-base-content/50">
                  <svg className="w-5 h-5 text-base-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>No public sharing</span>
                </li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-3xl p-8 shadow-lg border-2 border-primary/20 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-primary-content px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-medium text-base-content mb-2">Pro</h3>
                <p className="text-base-content/70 mb-6">For serious writers</p>
                <div className="mb-8">
                  <span className="text-4xl font-light text-base-content">$1.99</span>
                  <span className="text-base-content/60 ml-2">/month</span>
                </div>
                <div className="text-center mb-8">
                  <p className="text-sm text-base-content/60">$19.9 yearly</p>
                </div>
                <Link 
                  href="/signup" 
                  className="btn btn-primary w-full mb-8 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Start Free Trial
                </Link>
              </div>
              <ul className="space-y-4 text-base-content/70">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>5,000 documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>1GB assets storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100 versions per document</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Public sharing links</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Password protection</span>
                </li>
              </ul>
            </div>

            {/* Max Plan */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 shadow-sm border border-base-300/50 relative">
              <div className="text-center">
                <h3 className="text-2xl font-medium text-base-content mb-2">Max</h3>
                <p className="text-base-content/70 mb-6">For power users</p>
                <div className="mb-8">
                  <span className="text-4xl font-light text-base-content">$3.99</span>
                  <span className="text-base-content/60 ml-2">/month</span>
                </div>
                <div className="text-center mb-8">
                  <p className="text-sm text-base-content/60">$39.9 yearly</p>
                </div>
                <Link 
                  href="/signup" 
                  className="btn btn-outline w-full mb-8 hover:bg-primary hover:border-primary hover:text-primary-content transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>
              <ul className="space-y-4 text-base-content/70">
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Unlimited documents</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>10GB assets storage</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>100 versions per document</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Priority email support</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Public sharing links</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-success flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Password protection</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-32 bg-base-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          <div className="text-center mb-16 lg:mb-20">
            <h2 className="text-4xl lg:text-6xl font-light mb-6 text-base-content tracking-tight">
              Loved by <span className="text-primary font-medium">Writers</span>
            </h2>
            <p className="text-xl lg:text-2xl text-base-content/60 max-w-3xl mx-auto font-light leading-relaxed">
              Join thousands of creators who have found their perfect writing sanctuary.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Testimonial 1 */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 lg:p-10 shadow-sm border border-base-300/50">
              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-base-content/70 text-lg leading-relaxed mb-6">
                &quot;MarkNest transformed my writing process. The clean interface and distraction-free environment 
                helped me focus on what matters most - my words.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium text-lg">SK</span>
                </div>
                <div>
                  <h4 className="font-medium text-base-content">Sarah Kim</h4>
                  <p className="text-base-content/60 text-sm">Technical Writer</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 lg:p-10 shadow-sm border border-base-300/50">
              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-base-content/70 text-lg leading-relaxed mb-6">
                &quot;The live preview and version history features are game-changers. I can experiment with my writing 
                without fear of losing previous versions.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
                  <span className="text-secondary font-medium text-lg">MJ</span>
                </div>
                <div>
                  <h4 className="font-medium text-base-content">Marcus Johnson</h4>
                  <p className="text-base-content/60 text-sm">Novelist</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-gradient-to-br from-base-100 to-base-200 rounded-3xl p-8 lg:p-10 shadow-sm border border-base-300/50">
              <div className="flex items-center gap-2 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-warning" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-base-content/70 text-lg leading-relaxed mb-6">
                &quot;Perfect for our content team. The collaboration features and folder organization 
                keep our documentation projects running smoothly.&quot;
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent/10 rounded-full flex items-center justify-center">
                  <span className="text-accent font-medium text-lg">AR</span>
                </div>
                <div>
                  <h4 className="font-medium text-base-content">Alex Rivera</h4>
                  <p className="text-base-content/60 text-sm">Content Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary to-accent relative overflow-hidden">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 max-w-5xl mx-auto px-4 lg:px-6 text-center">
          <h2 className="text-4xl lg:text-6xl font-light text-primary-content mb-8 tracking-tight">
            Ready to Find Your <span className="font-medium">Flow</span>?
          </h2>
          <p className="text-xl lg:text-2xl text-primary-content/90 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Join a community of thoughtful writers who have discovered the peace of distraction-free writing. 
            Your ideas deserve a sanctuary.
          </p>
          <Link 
            href="/signup" 
            className="inline-flex items-center gap-3 bg-white text-primary hover:bg-base-100 px-10 py-5 rounded-2xl text-xl font-medium shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
          >
            Start Writing Today
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-base-200 py-16">
        <div className="max-w-6xl mx-auto px-4 lg:px-6 text-center">
          <div className="mb-8">
            <h3 className="text-3xl font-light text-base-content mb-2">
              Mark<span className="text-primary font-medium">Nest</span>
            </h3>
            <p className="text-base-content/60 text-lg font-light">Your sanctuary for thoughtful writing</p>
          </div>
          
          <div className="border-t border-base-300 pt-8">
            <p className="text-base-content/50 text-sm font-light">
              © 2024 MarkNest. Crafted with care for writers everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
