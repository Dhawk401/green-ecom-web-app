import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../styles/HeroSlider.css'; // Assuming you have a CSS file for styles

const HeroSlider = () => {
  return (
    <div className="hero-slider">
      <Swiper
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
      >
        <SwiperSlide>
          <img src="/assets/slider1.jpg" alt="Slide 1" className="slide-image" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/assets/slider2.jpg" alt="Slide 2" className="slide-image" />
        </SwiperSlide>
        <SwiperSlide>
          <img src="/assets/slider3.jpg" alt="Slide 3" className="slide-image" />
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default HeroSlider;
