import React, { useState } from "react";
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

  // ✅ Handlers for next/previous
  const prevImage = () => {
    setCurrentImage((prev) => (prev === 0 ? visionImages.length - 1 : prev - 1));
  };
  const nextImage = () => {
    setCurrentImage((prev) => (prev === visionImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="aboutus-page">
      {/* ---------- ABOUT SECTION ---------- */}
      <section className="about-section fade-in">
        <div className="about-content slide-right">
          <h1>About Us</h1>
          <p>
            Ugnayan ng Pahinungód is a volunteer service program dedicated to
            serving communities through education, health, and socio-civic
            engagement. We believe in empowering people through compassion,
            knowledge, and collective action.
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
          <img src={visionImages[currentImage]} alt="Volunteers at work" />

          {/* ✅ Carousel Arrows */}
          <button className="carousel-arrow left" onClick={prevImage}>
            &#10094; {/* ← */}
          </button>
          <button className="carousel-arrow right" onClick={nextImage}>
            &#10095; {/* → */}
          </button>
        </div>

        <div className="vision-content glass-box slide-right">
          <h2>Our Vision</h2>
          <p>
            A nation of empowered citizens working together to uplift
            communities in need, anchored on compassion and service.
          </p>

          <h2>Our Mission</h2>
          <p>
            To connect individuals, students, and organizations who share the
            same commitment to service and volunteerism through sustainable
            outreach and education programs.
          </p>
        </div>
      </section>

      {/* ---------- CONTACT SECTION ---------- */}
      <section className="contact-section glass-box fade-in">
        <h2>Contact Us</h2>
        <p>Email: pahinungod.upmindanao@up.edu.ph</p>
        <p>Phone: (082) 293-0201</p>
        <p>Address: UP Mindanao Campus, Mintal, Davao City</p>
      </section>
    </div>
  );
};

export default AboutUs;
