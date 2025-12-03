
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import Learning from './pages/Learning';
import Progress from './pages/Progress';
import Teacher from './pages/Teacher';
import Command from './pages/Command';
import Audio from './pages/Audio';
import Author from './pages/Author';
import Admin from './pages/Admin';

const App = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn" element={<Learning />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/command" element={<Command />} />
          <Route path="/audio" element={<Audio />} />
          <Route path="/author" element={<Author />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
