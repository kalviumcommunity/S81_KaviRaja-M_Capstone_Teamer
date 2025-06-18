import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Auth/login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import VideoCall from "./pages/VideoCall/VideoCall";
import { useAuth } from "./context/AuthContext";
import ChatTester from "./components/ChatTester";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/* Wrap dashboard/chat routes with providers */}
      <Route
        path="/dashboard"
        element={
          <SocketProvider>
            <ChatProvider>
              <Dashboard />
            </ChatProvider>
          </SocketProvider>
        }
      />
      <Route
        path="/video-call/:callId"
        element={
          <SocketProvider>
            <VideoCall />
          </SocketProvider>
        }
      />
      <Route
        path="/chat-test"
        element={
          <SocketProvider>
            <ChatProvider>
              <ChatTester />
            </ChatProvider>
          </SocketProvider>
        }
      />
    </Routes>
  );
};

export default App;
