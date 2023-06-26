import React from "react";

interface ResultsProps {
  results: JSX.Element[];
}

export const Results: React.FC<ResultsProps> = ({ results }) => {
  return <div id="names">{results}</div>;
};
