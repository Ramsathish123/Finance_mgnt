import { createContext, useContext, useEffect, useState } from "react";

const FileContext = createContext();

export const useFileContext = () => useContext(FileContext);

export const FileProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    // Load from localStorage initially
    const storedUsers = localStorage.getItem("users");
    return storedUsers ? JSON.parse(storedUsers) : [];
  });

  // Save to localStorage whenever `users` changes
  useEffect(() => {
    localStorage.setItem("users", JSON.stringify(users));
  }, [users]);

  return (
    <FileContext.Provider value={{ users, setUsers }}>
      {children}
    </FileContext.Provider>
  );
};
