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
