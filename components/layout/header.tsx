import { motion } from "framer-motion";
import Link from "next/link";
import { FC, useState } from "react";
import { TbLetterA, TbLetterS } from "react-icons/tb";
import { Tooltip } from "react-tippy";
const menuItems = [
  {
    title: "Contact",
    route: "/contact",
  },
];

export const Header: FC = () => {
  return (
    <div className="text-white fixed top-0 left-0 right-0 z-50 font-Kanit">
      <div
        className={`flex bg-theme justify-between items-center p-2 shadow-lg`}
      >
        <div className="flex justify-between items-center w-full">
          <h1 className="text-4xl  flex flex-row font-semibold">
            <Tooltip title="Amjad" position="bottom" trigger="mouseenter">
              <TbLetterA />
            </Tooltip>
            <Tooltip title="Shaaban" position="bottom" trigger="mouseenter">
              <TbLetterS />
            </Tooltip>
          </h1>
        </div>

        <motion.div
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.8 }}
          className="flex text-2xl"
        >
          {menuItems.map((item) => (
            <li key={item.title} className={`list-none mx-5 p-1`}>
              <Link href={item.route}>{item.title}</Link>
            </li>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
