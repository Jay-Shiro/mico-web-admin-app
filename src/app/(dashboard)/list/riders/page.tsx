"use client";

import { SetStateAction } from "react";
import Image from "next/image";
import { useState } from "react";

const RidersListPage = () => {
  return (
    <>
      {/*TOP*/}
      <div className="bg-white p-4 h-[173px] rounded-md flex flex-col m-4 mt-0 justify-between">
        <h1 className="text-2xl text-color1 font-semibold">Manage Riders</h1>
        <SearchInput input={"Enter riders details"} setInput={function (value: SetStateAction<string>): void {
          throw new Error("Function not implemented.");
        } } filterRiders={function (): void {
          throw new Error("Function not implemented.");
        } } />
      </div>
      {/*BOTTOM*/}
      <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
        <div className="flex justify-between">
          <h1 className="hidden md:block text-lg text-color1 font-semibold">All Riders</h1>
          <div className="flex items-center justify-end">
          
          </div>
        </div>
      </div>
      {/*PAGINATION*/}
      <div></div>
    </>
  );
};

export function ToggleButton() {
  const [isToggled, setIsToggled] = useState(false);

  return (
    <button
      className={`p-2 rounded-2xl text-sm font-semibold transition-all ${
        isToggled ? "bg-color1 text-white" : "bg-color3"
      }`}
      onClick={() => setIsToggled(!isToggled)}
    >
      {isToggled ? "On" : "Off"}
    </button>
  );
}

interface SearchInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  filterRiders: () => void;
}

const SearchInput = ({ input, setInput, filterRiders }: SearchInputProps) => {
  return (
    <><div className="flex items-center border rounded-2xl bg-white p-2">
      <input
        type="text"
        className="flex-grow p-1 outline-none text-gray-400"
        placeholder="Search riders..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && filterRiders()} />
    </div>
    <div className="flex justify-end">
        <button className="bg-color1 text-xl text-white font-semibold px-6 py-2 rounded-2xl" onClick={filterRiders}>
          Search
        </button>
    </div></>
  );
};


export default RidersListPage;
