import { FormEvent, useState } from "react";
import { Loader, Placeholder } from "@aws-amplify/ui-react";
import "./App.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

import "@aws-amplify/ui-react/styles.css";

Amplify.configure(outputs);

function App() {
  return (
    <div className="app-container">
      <div className="header-container">
        <h1 className="main-header">
          This here is
          <br />
          <span className="highlight">just a website</span>
        </h1>
        <p className="description">
          You can develop your own website and deploy it to AWS Amplify.
        </p>
      </div>
    </div>
  );
}
export default App;
