import Search from "@/components/Search";
import React from "react";

import localFont from 'next/font/local'


const username = "kyza0d"
const fontname = "FantasqueSansMono_Regular"

// TODO: Figure out how to use the font file from the user's upload 
// const myFont = localFont({ src: `../fonts/${username}_${fontname}.ttf` })
const myFont = localFont({ src: '../fonts/kyza0d_FantasqueSansMono_Regular.ttf' })

const TestComponent = () => {
  return (
    <div className={myFont.className}>
      This is a test using the Fantasque Sans Mono font.
    </div>
  );
};

const Glyphs = () => {
  return (
    <main className="font-[Symbols Nerd Font]">
      <TestComponent />
      <Search itemsFile="glyphnames.json" />
    </main>
  );
};

export default Glyphs;
