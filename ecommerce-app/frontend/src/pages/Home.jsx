//home page 
import React from 'react';
import HeroSlider from '../components/HeroSlider';
import ProductGrid from '../components/ProductGrid';
import ComboSection from '../components/ComboSection';
import TestimonialSlider from '../components/TestimonialSlider';
import NewsletterSubscribe from '../components/NewsletterSubscribe';
import '../styles/Home.css'; // Assuming you have a CSS file for styles

const Home = () => {
  return (
    <div className="home-wrapper">
      <HeroSlider />
      <ProductGrid title="Trending Products" limit={8} />
      <TestimonialSlider />
    </div>
  );
};

export default Home;
