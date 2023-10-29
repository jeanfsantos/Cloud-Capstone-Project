import { Route, Routes, BrowserRouter } from 'react-router-dom';

import Navbar from './components/Navbar';
import Chat from './pages/Chat';
import CreateChannel from './pages/CreateChannel';
import Home from './pages/Home';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="container mt-5">
        <Routes>
          <Route path="/channels/create" element={<CreateChannel />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
