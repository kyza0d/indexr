import React from "react";

import Search from "@/components/search/Search";

const Local = () => {
  return (
    <main>
      <Search itemsFile="usernames.json" />
    </main>
  );
};

export default Local;
