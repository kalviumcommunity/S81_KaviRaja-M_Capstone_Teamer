import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const UserSearch = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const { user } = useAuth();

  const handleSearch = async (e) => {
    setQuery(e.target.value);
    if (e.target.value.trim().length === 0) {
      setResults([]);
      return;
    }
    const res = await axios.get(
      `/api/users/search?q=${encodeURIComponent(e.target.value)}`,
      { withCredentials: true }
    );
    // Exclude self
    setResults(res.data.filter(u => u._id !== user._id));
  };

  return (
    <div className="p-4">
      <input
        type="text"
        placeholder="Search users..."
        value={query}
        onChange={handleSearch}
        className="w-full p-2 border rounded"
      />
      {results.length > 0 && (
        <ul className="bg-white rounded shadow mt-2">
          {results.map(u => (
            <li
              key={u._id}
              className="p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => onSelectUser(u)}
            >
              {u.name} ({u.username})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserSearch;