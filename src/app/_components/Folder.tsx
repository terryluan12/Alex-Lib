"use client";
import { useEffect } from "react";

export const Folder = ({ name }: { name: string }) => {
  return (
    <div className="flex text-black bg-bone rounded w-48 h-12 m-2 justify-center items-center text-center">
      <h1>{name}</h1>
    </div>
  );
};
