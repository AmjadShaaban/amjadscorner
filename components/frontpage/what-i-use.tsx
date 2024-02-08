import { FC } from "react";
import { Tooltip } from "react-tippy";
import { ICONS_DATA } from "../../data";
import { LuConstruction } from "react-icons/lu";

export const WhatIUse: FC = () => {
  return (
    <div className="mt-20">
      <h1 className="text-4xl text-red-500 font-bold text-center my-8">
        Plesee excuse me while im renovating this site
      </h1>
      <LuConstruction
        size={360}
        className="w-full text-center text-yellow-500 mt-20 animate-pulse hover:text-orange-500"
      />
      <h3 className="text-2xl text-blue-600 font-bold text-center my-8">
        Some of the technologies I use
      </h3>
      <div className="grid md:grid-cols-1 grid-cols-4">
        {ICONS_DATA.map((item) => {
          const { icon } = item;
          return (
            <Tooltip key={item.title} title={item.title} position="bottom">
              {icon}
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
