import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SocialLinkButton from "@/components/SocialLinkButton";
import ChatPreview from "@/components/ChatPreview";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-60"
               style={{background: "radial-gradient(60% 60% at 20% 20%, rgba(230,255,58,0.15), transparent 60%), radial-gradient(50% 50% at 80% 30%, rgba(138,92,246,0.25), transparent 60%)"}} />
          <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <span className="chip mb-5">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                Membership · early access
              </span>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.05]">
                Where fans and artists <span className="text-brand">actually</span> connect.
              </h1>
              <p className="mt-5 text-muted text-lg max-w-xl">
                Join the FansFest community. Link your Spotify, talk with other fans in realtime,
                and never miss a drop from the artists you love.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup" className="btn-primary px-5 py-3 text-base">Join FansFest</Link>
                <Link href="#chat" className="btn-secondary px-5 py-3 text-base">Peek the chat</Link>
              </div>
              <div className="mt-10 flex items-center gap-6 text-sm text-muted">
                <div className="flex -space-x-2">
                  {["bg-brand","bg-accent","bg-pink-500","bg-blue-400"].map((c,i) =>
                    <div key={i} className={`h-7 w-7 rounded-full ring-2 ring-bg ${c}`} />
                  )}
                </div>
                <div>4,200+ members already in the community</div>
              </div>
            </div>

            {/* Chat preview card */}
            <div id="chat" className="md:justify-self-end w-full max-w-md">
              <ChatPreview />
            </div>
          </div>
        </section>

        {/* Social link section */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">Follow the fest</h2>
              <p className="text-muted text-sm mt-1">All our channels in one place.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <SocialLinkButton platform="spotify" href="https://open.spotify.com" label="Spotify" />
            <SocialLinkButton platform="instagram" href="https://instagram.com" label="Instagram" />
            <SocialLinkButton platform="tiktok" href="https://tiktok.com" label="TikTok" />
            <SocialLinkButton platform="x" href="https://x.com" label="X / Twitter" />
          </div>
        </section>

        {/* Value props */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 md:py-16 grid md:grid-cols-3 gap-4">
          {[
            { t: "Connect your Spotify", d: "Pull your top artists and tracks to show up as your real music self." },
            { t: "Chat in realtime", d: "Jump into the community lounge and talk shows, drops, and demos." },
            { t: "Never miss a drop", d: "Follow the artists you love and get notified when something new lands." },
          ].map((f,i) => (
            <div key={i} className="card p-6">
              <div className="h-10 w-10 rounded-lg bg-brand/10 grid place-items-center text-brand font-bold">
                0{i+1}
              </div>
              <div className="mt-4 font-display font-semibold text-lg">{f.t}</div>
              <div className="text-sm text-muted mt-1.5">{f.d}</div>
            </div>
          ))}
        </section>
      </main>
      <Footer />
    </>
  );
}
