import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../components/Button";
import heroImage from "../assets/UNP Logo.png"; 
import volunteerImage from "../assets/volunteer.png";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#f4dcdc] to-[#7B1113]">
      {/* Header */}
      <Header variant="default" />

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-16 bg-[#7B1113] text-white px-4">
        <div className="max-w-3xl">
          <img
            src={heroImage}
            alt="Ugnayan ng Pahinungod Logo"
            className="mx-auto w-32 mb-6"
          />
          <h1 className="text-3xl md:text-5xl font-bold mb-6">
            UGNAYAN NG PAHINUNGOD
          </h1>
          <Button label="Know More" className="px-6 py-3 rounded-full border-2 border-white hover:bg-white hover:text-[#7B1113]" />
        </div>
      </section>

      {/* Volunteer Section */}
      <section className="flex flex-col md:flex-row justify-between items-center py-20 px-8 bg-[#f9e8e8] text-[#7B1113]">
        <div className="max-w-md mb-8 md:mb-0">
          <h2 className="text-3xl font-semibold mb-4">
            Help shape tomorrow — <br /> volunteer today.
          </h2>
          <Button label="Volunteer" className="bg-[#7B1113] text-white hover:bg-[#5a0d0e]" />
        </div>
        <div className="rounded-2xl overflow-hidden shadow-lg">
          <img
            src={volunteerImage}
            alt="Volunteer"
            className="w-[400px] h-[260px] object-cover"
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
