import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Skills } from "@/components/Skills";
import { FeaturedProject } from "@/components/FeaturedProject";
import { WhatItDemonstrates } from "@/components/WhatItDemonstrates";
import { DemoAccess } from "@/components/DemoAccess";
import { TechnicalSnapshot } from "@/components/TechnicalSnapshot";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Skills />
        <FeaturedProject />
        <WhatItDemonstrates />
        <DemoAccess />
        <TechnicalSnapshot />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
