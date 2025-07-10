import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import '../styles/Testimonial.css'; // Assuming you have a CSS file for styles

const testimonials = [
  {
    name: 'Anjali M.',
    quote: 'Absolutely love my new sofa! Great quality and quick delivery.',
  },
  {
    name: 'Rohan K.',
    quote: 'Affordable luxury furniture. Their designs are top notch.',
  },
  {
    name: 'Meera S.',
    quote: 'Customer support was excellent. Highly recommended!',
  },
];

const TestimonialSlider = () => {
  return (
    <div className="testimonial-section">
      <div className="testimonial-container">
        <h2 className="testimonial-heading">What Our Customers Say</h2>
        <Swiper
          spaceBetween={30}
          slidesPerView={1}
          loop={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          modules={[Autoplay]}
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <div className="testimonial-card">
                <p className="testimonial-quote">"{t.quote}"</p>
                <p className="testimonial-name">— {t.name}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default TestimonialSlider;
