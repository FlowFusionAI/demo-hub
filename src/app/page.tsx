import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { StatusBar } from "@/components/StatusBar";
import { Floor } from "@/components/Floor";
import { Operator } from "@/components/Operator";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <StatusBar />
        <Floor />
        <Operator />
      </main>
      <Footer />
    </>
  );
}
