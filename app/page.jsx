import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import InteractiveLanding from "@/components/InteractiveLanding";

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <InteractiveLanding />
      </main>
      <Footer />
    </>
  );
}
