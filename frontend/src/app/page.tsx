import { HeroSection } from "@/components/home/HeroSection";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { LatestArticles } from "@/components/home/LatestArticles";
import { BrandSection } from "@/components/home/BrandSection";
import { GallerySection } from "@/components/home/GallerySection";
import { ContactSection } from "@/components/home/ContactSection";

export default function HomePage() {
    return (
        <main>
            <HeroSection />
            <FeaturedProducts />
            <BrandSection />
            <LatestArticles />
            <GallerySection />
            <ContactSection />
        </main>
    );
}