import React from "react";

import Search from "@/components/search/search";

const Local = () => {
  return (
    <main>
      <Search itemsFile="usernames.json" />
    </main>
  );
};

export default Local;
