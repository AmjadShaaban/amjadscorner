import type { NextPage } from "next";
import { Introduction, WhatIUse, WhoAmI } from "../components/frontpage";
import { Layout } from "../components/layout";

const Home: NextPage = () => {
  return (
    <Layout>
      <Introduction />
      <WhatIUse />
      <WhoAmI />
    </Layout>
  );
};

export default Home;
