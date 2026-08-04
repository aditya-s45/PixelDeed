"use client"
import React from "react";
import HeroSection from "../components/hero_section";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <main className="h-screen bg-black">
      <Navbar />
      <HeroSection />
    </main>
  );
}