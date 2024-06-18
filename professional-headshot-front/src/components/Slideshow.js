import React from "react";
import Slider from "react-slick";
import Skeleton from "react-loading-skeleton";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Slideshow = ({ images, loading }) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1200,
    arrows: false,
    pauseOnHover: true,
    cssEase: "ease-in-out",
  };

  return (
    <div className="carousel-container mt-10">
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className="p-2">
            <img
              src={image}
              alt={`Generated headshot ${index}`}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default React.memo(Slideshow);
