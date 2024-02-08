import type { NextPage } from "next";
import {
  DevStack,
  Introduction,
  Passion,
  WhatIUse,
  WhoAmI,
} from "../components/frontpage";
import { Layout } from "../components/layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <Introduction />
      <WhatIUse />
      <Passion />
      <DevStack />
      <WhoAmI />
    </Layout>
  );
};

export default Home;
