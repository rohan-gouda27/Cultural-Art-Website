import { useSearchParams } from 'react-router-dom';
import Hero from '../components/home/Hero';
import LiveProjectsSection from '../components/home/LiveProjectsSection';
import TrendingStyles from '../components/home/TrendingStyles';
import BeforeAfterGallery from '../components/home/BeforeAfterGallery';
import Testimonials from '../components/home/Testimonials';
import WhyCulturalArt from '../components/home/WhyCulturalArt';
import RecentlyAddedArtists from '../components/home/RecentlyAddedArtists';
import PopularInCity from '../components/home/PopularInCity';
import CustomRequestSection from '../components/home/CustomRequestSection';
import SupportArtisans from '../components/home/SupportArtisans';

export default function Home() {
  const [searchParams] = useSearchParams();
  const openRequest = searchParams.get('request') === '1';
  const artistId = searchParams.get('artist') || '';
  return (
    <div>
      <Hero />
      <LiveProjectsSection />
      <TrendingStyles />
      <BeforeAfterGallery />
      <Testimonials />
      <WhyCulturalArt />
      <RecentlyAddedArtists />
      <PopularInCity />
      <CustomRequestSection openRequest={openRequest} preselectedArtistId={artistId} />
      <SupportArtisans />
    </div>
  );
}
