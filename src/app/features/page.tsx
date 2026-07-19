import ParticlesBackground from "@/components/particles-background";

export default function FeaturesPage() {
  const features = [
    { title: "Dynamic QR Ticketing", desc: "Automated, secure QR code generation for every registration. Scanning enabled for seamless on-site check-ins." },
    { title: "Real-time Capacity", desc: "Live seat tracking using Firebase Firestore. Available slots update instantly across the entire platform." },
    { title: "Secure Middleware", desc: "Next.js Edge runtime route protection ensuring data privacy and role-based access control." },
    { title: "Cinematic 3D UI", desc: "Hardware-accelerated Framer Motion animations and GSAP sequences delivering a premium aesthetic." }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white pt-24 font-sans">
      <ParticlesBackground />
      
      <div className="container mx-auto max-w-7xl px-6 sm:px-10 relative z-10 pb-20">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Platform <span className="text-cyan-400">Features</span></h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Built with a modern tech stack to deliver a seamless, scalable, and visually stunning event management experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-cyan-400/20 flex items-center justify-center mb-6">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
