import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Home } from './pages/Home';
import { Courses } from './pages/Courses';
import { Practice } from './pages/Practice';
import EmotionPractice from './pages/EmotionPractice';
import { PhraseDictionary } from './pages/PhraseDictionary';
import { AlphabetSongs } from './pages/AlphabetSongs';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/emotions" element={<EmotionPractice />} />
            <Route path="/phrases" element={<PhraseDictionary />} />
            <Route path="/alphabet-songs" element={<AlphabetSongs />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;