import React from "react";
import BugList from "./components/BugList";

function App() {
  return (
    <div>
      <h1 className="main-title">BugPilot</h1>
      <p className="tagline">Smart Bug Tracking Dashboard</p>
      <BugList />
    </div>
  );
}

export default App;