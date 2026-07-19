import ParticlesBackground from "@/components/particles-background";

export default function ImpactPage() {
  const stats = [
    { value: "50+", label: "Global Tech Events Hosted" },
    { value: "10k+", label: "Active Student Registrations" },
    { value: "100%", label: "Secure Ticket Scans" },
    { value: "0ms", label: "Perceived Latency" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-black text-white pt-24 font-sans">
      <ParticlesBackground />
      
      <div className="container mx-auto max-w-7xl px-6 sm:px-10 relative z-10 pb-20">
        <div className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our <span className="text-cyan-400">Impact</span></h1>
          <p className="text-white/60 text-lg max-w-2xl">
            Empowering the next generation of developers and innovators through seamless tech event logistics.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
              <h2 className="text-4xl md:text-5xl font-bold text-cyan-400 mb-2">{stat.value}</h2>
              <p className="text-white/70 text-sm tracking-wider uppercase font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-8 lg:p-12">
           <h3 className="text-2xl font-bold mb-6 text-cyan-400">Why Evora?</h3>
           <p className="text-white/70 leading-relaxed text-lg mb-6">
             In an era where technology moves faster than ever, event management needs to keep pace. Evora was built to eliminate the friction between discovery and participation. By leveraging serverless edge computing, real-time NoSQL databases, and robust authentication, we provide a reliable infrastructure for high-traffic technology summits.
           </p>
           <p className="text-white/70 leading-relaxed text-lg">
             Our mission is to ensure that students and professionals can focus on learning, networking, and building the future, while we handle the complex logistics of scale.
           </p>
        </div>
      </div>
    </div>
  );
}
