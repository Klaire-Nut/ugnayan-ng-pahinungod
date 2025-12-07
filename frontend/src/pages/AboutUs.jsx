import React, { useState, useEffect } from "react";
import "../styles/AboutUs.css";

// Assets
import uplogo from "../assets/UNP Logo.png";
import about1 from "../assets/about1.png";
import about2 from "../assets/about2.png";
import about3 from "../assets/about3.png";

const AboutUs = () => {
  // ✅ State to track current carousel image
  const [currentImage, setCurrentImage] = useState(0);

  // ✅ Array of images for carousel
  const visionImages = [about1, about2, about3];

  // ✅ Automatically change image every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) =>
        prev === visionImages.length - 1 ? 0 : prev + 1
      );
    }, 3000); // ⏱ change image every 3 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [visionImages.length]);

  // ✅ Manual navigation (optional)
  const prevImage = () => {
    setCurrentImage((prev) =>
      prev === 0 ? visionImages.length - 1 : prev - 1
    );
  };
  const nextImage = () => {
    setCurrentImage((prev) =>
      prev === visionImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="aboutus-page">
      {/* ---------- ABOUT SECTION ---------- */}
      <section className="about-section fade-in">
        <div className="about-content slide-right">
          <h1>About Us</h1>
          <p>
            Ugnayan ng Pahinungód Mindanao is the volunteer service
            program of the University of the Philippines Mindanao. It strives
            to nurture a culture of volunteerism and foster a sense of
            community involvement within the UP system. The program's
            public service delivery primarily targets underserved
            communities. It also aims to foster character development and values education among the
            UP's students, faculty, staff, and alumni.
          </p>
        </div>

        <div className="about-image slide-left">
          <img src={uplogo} alt="UP Ugnayan ng Pahinungód Logo" />
        </div>
      </section>

      {/* ---------- VISION & MISSION SECTION ---------- */}
      <section className="vision-section fade-in">
        <div className="vision-image slide-left">
          {/* ✅ Carousel Image */}
          <img
            src={visionImages[currentImage]}
            alt="Volunteers at work"
            className="carousel-image"
          />

          {/* ✅ Carousel Arrows */}
          <button className="carousel-arrow left" onClick={prevImage}>
            &#10094;
          </button>
          <button className="carousel-arrow right" onClick={nextImage}>
            &#10095;
          </button>
        </div>

        <div className="vision-content glass-box slide-right">
          <h2>Our Vision</h2>
          <p>
            UP in the service of the underserved
            communities through volunteerism.
          </p>

          <h2>Our Mission</h2>
          <p>
            To lead in innovative and
            transformative engagements as the
            public service university committed to
            the empowerment of people and
            selfless service to the nation. 
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
