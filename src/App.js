import React from 'react';
import { Routes, Route } from "react-router-dom";

import './App.css';
import Create from "./Create";
import Receive from "./Receive";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/create" element={<Create />} />
        <Route path="/receive" element={<Receive />} />
        <Route path="/*" element={<Create />} />
      </Routes>
    </div>
  );
}

export default App;
