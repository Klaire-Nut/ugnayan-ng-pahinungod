import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import img1 from "../assets/about1.jpg";
import img2 from "../assets/about2.jpg";
import img3 from "../assets/about3.jpg";

export default function AboutUs() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f9e8e8] to-[#7B1113] text-[#7B1113]">
      {/* Header */}
      <Header variant="default" />

      {/* About Section */}
      <section className="flex flex-col md:flex-row items-center justify-center py-20 px-8 gap-12 bg-[#f9e8e8]">
        <div className="w-full md:w-1/2">
          <Carousel
            showThumbs={false}
            infiniteLoop
            autoPlay
            showStatus={false}
            className="rounded-2xl shadow-lg"
          >
            <div>
              <img src={img1} alt="Community Outreach" className="object-cover h-[320px]" />
            </div>
            <div>
              <img src={img2} alt="Volunteers" className="object-cover h-[320px]" />
            </div>
            <div>
              <img src={img3} alt="UP Pahinungod Activities" className="object-cover h-[320px]" />
            </div>
          </Carousel>
        </div>

        <div className="w-full md:w-1/2 text-left">
          <h1 className="text-4xl font-bold mb-4">About Ugnayan ng Pahinungod</h1>
          <p className="mb-6 leading-relaxed">
            Ugnayan ng Pahinungod is the volunteer service program of the University of the Philippines. 
            It aims to link the academic community with sectors of society that need assistance through 
            volunteerism, knowledge sharing, and service learning. Our mission is to nurture a culture 
            of compassion and civic responsibility that extends beyond the campus.
          </p>
          <Button label="Join Us" className="bg-[#7B1113] text-white hover:bg-[#5a0d0e]" />
        </div>
      </section>

      {/* Contact Section */}
      <section className="bg-[#7B1113] text-white py-20 px-8 flex flex-col items-center">
        <h2 className="text-3xl font-semibold mb-6">Contact Us</h2>
        <p className="max-w-2xl text-center mb-8">
          Have questions, feedback, or would like to collaborate? We’d love to hear from you. 
          Reach out through our contact form or send us an email.
        </p>
        <div className="bg-white text-[#7B1113] rounded-2xl shadow-lg p-8 w-full max-w-lg">
          <form className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Your Name"
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1113]"
              required
            />
            <input
              type="email"
              placeholder="Your Email"
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1113]"
              required
            />
            <textarea
              placeholder="Your Message"
              rows="4"
              className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7B1113]"
              required
            ></textarea>
            <Button label="Send Message" className="bg-[#7B1113] text-white hover:bg-[#5a0d0e]" />
          </form>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
