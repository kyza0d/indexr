"use client"

import { CreateCard } from "@/components/create";
import { UploadIcon } from "@radix-ui/react-icons";
import { Button } from "components/ui/button";
import React from "react";

export default function Home() {
  const [show, setShow] = React.useState(false);

  const handleClose = () => function() {
    setShow(false)
  }

  return (
    <div className="flex flex-col items-start justify-center min-h-screen py-2 max-w-[50vw] mx-auto">
      <Button type="button" variant="outline" onClick={() => setShow(!show)}><UploadIcon className="-ml-1 mr-2 h-5 w-5" /> Add new Database</Button>
      {show && <CreateCard onClose={handleClose} />}
    </div>
  );
}
