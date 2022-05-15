import {
  FaAngular,
  FaCss3,
  FaGitAlt,
  FaHtml5,
  FaNodeJs,
  FaReact,
} from 'react-icons/fa';
import {
  SiJavascript,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
} from 'react-icons/si';

const ICON_SIZE = 180;
const ICON_CLASSNAME = 'w-full text-center mt-20 hover:animate-pulse';

export const ICONS_DATA = [
  {
    title: 'TypeScript',
    icon: (
      <SiTypescript
        size={ICON_SIZE}
        color='#2762BA'
        className={ICON_CLASSNAME}
      />
    ),
  },
  {
    title: 'JavaScript',
    icon: (
      <SiJavascript
        size={ICON_SIZE}
        color='yellow'
        className={ICON_CLASSNAME}
      />
    ),
  },
  {
    title: 'NodeJs',
    icon: (
      <FaNodeJs size={ICON_SIZE} color='green' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'HTML5',
    icon: (
      <FaHtml5 size={ICON_SIZE} color='#CD331D' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'CSS3',
    icon: (
      <FaCss3 size={ICON_SIZE} color='#094FA8' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'Git',
    icon: <FaGitAlt size={ICON_SIZE} color='red' className={ICON_CLASSNAME} />,
  },
  {
    title: 'React',
    icon: (
      <FaReact size={ICON_SIZE} color='#53D3FA' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'NextJs',
    icon: (
      <SiNextdotjs size={ICON_SIZE} color='black' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'Angular',
    icon: (
      <FaAngular size={ICON_SIZE} color='#CD1624' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'MongoDB',
    icon: (
      <SiMongodb size={ICON_SIZE} color='#1EE64F' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'MySQL',
    icon: (
      <SiMysql size={ICON_SIZE} color='#0C5F78' className={ICON_CLASSNAME} />
    ),
  },
  {
    title: 'Tailwind CSS',
    icon: (
      <SiTailwindcss
        size={ICON_SIZE}
        color='#30AEF7'
        className={ICON_CLASSNAME}
      />
    ),
  },
];
