import React from "react";
import LoadingScreen from "./components/LoadingScreen";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Auth/login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import VideoCall from "./pages/VideoCall/VideoCall";
import { useAuth } from "./context/AuthContext";
import ChatTester from "./components/ChatTester";
import { SocketProvider } from "./context/SocketContext";
import { ChatProvider } from "./context/ChatContext";
import Callback from './pages/Auth/Callback';

const ProtectedDashboard = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <SocketProvider>
      <ChatProvider>
        <Dashboard />
      </ChatProvider>
    </SocketProvider>
  );
};

const ProtectedVideoCall = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <SocketProvider>
      <VideoCall />
    </SocketProvider>
  );
};

const ProtectedChatTest = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <SocketProvider>
      <ChatProvider>
        <ChatTester />
      </ChatProvider>
    </SocketProvider>
  );
};


const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen message="Starting up..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedDashboard />} />
      <Route path="/video-call/:roomId" element={<ProtectedVideoCall />} />
      <Route path="/chat-test" element={<ProtectedChatTest />} />
      <Route path="/auth/callback" element={<Callback />} />
    </Routes>
  );
};

export default App;
