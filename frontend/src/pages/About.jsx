// src/pages/About.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const About = () => {
  return (
    <div>
      <h1>About Page</h1>
      <Outlet />
    </div>
  );
};

export default About;
