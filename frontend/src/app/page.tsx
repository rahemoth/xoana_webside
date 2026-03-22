import { Navbar, Footer } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { LatestArticles } from "@/components/home/LatestArticles";
import { BrandSection } from "@/components/home/BrandSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturedProducts />
        <BrandSection />
        <LatestArticles />
        <GallerySection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
