import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import WelcomeRoutes  from './pages/welcome/welcome';
import './App.css'

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <button>
        <Link to="/welcome">Let's go</Link>
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/welcome" element={<WelcomeRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;

