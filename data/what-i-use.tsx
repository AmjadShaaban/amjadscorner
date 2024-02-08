import { FaNode, FaCss3, FaGit } from "react-icons/fa6";
import { SiMongodb, SiMysql, SiNextdotjs, SiTailwindcss } from "react-icons/si";
import {
  TbBrandTypescript,
  TbBrandHtml5,
  TbBrandAngular,
  TbBrandReact,
  TbBrandJavascript,
} from "react-icons/tb";

const ICON_SIZE = 180;
const ICON_CLASSNAME = "w-full text-center mt-20 hover:animate-pulse";

export const ICONS_DATA = [
  {
    title: "TypeScript",
    icon: <TbBrandTypescript size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "JavaScript",
    icon: <TbBrandJavascript size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "NodeJs",
    icon: <FaNode size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "HTML5",
    icon: <TbBrandHtml5 size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "CSS3",
    icon: <FaCss3 size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "Git",
    icon: <FaGit size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "React",
    icon: <TbBrandReact size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "NextJs",
    icon: <SiNextdotjs size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "Angular",
    icon: <TbBrandAngular size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "MongoDB",
    icon: <SiMongodb size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "MySQL",
    icon: <SiMysql size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
  {
    title: "Tailwind CSS",
    icon: <SiTailwindcss size={ICON_SIZE} className={ICON_CLASSNAME} />,
  },
];
