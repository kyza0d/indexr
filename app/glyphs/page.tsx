"use client"

import Search from "@/components/search";
import React from "react";

const Glyphs = () => {
  return (
    <main className="font-[Symbols Nerd Font]">
      <Search itemsFile="glyphnames.json" />
    </main>
  );
};

export default Glyphs;