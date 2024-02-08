import { NextPage } from "next";
import { Layout } from "../components/layout";

const TestPage: NextPage = () => {
  return (
    <Layout>
      <button
        className="border-2"
        onClick={() => {
          console.log("A Show Alert!!!");
        }}
      >
        Show
      </button>
      <button
        className="border-2"
        onClick={() => {
          console.log("A Success Alert!!!");
        }}
      >
        Success
      </button>
      <button
        className="border-2"
        onClick={() => {
          console.log("An Error Alert!!!");
        }}
      >
        Error
      </button>
      <button
        className="border-2"
        onClick={() => {
          console.log("An Info Alert!!!");
        }}
      >
        Info
      </button>
    </Layout>
  );
};

export default TestPage;
