import { useEffect } from "react";
import { socket } from "./socket";
import CustomChatUI from "./components/CustomChatUI";
import UsersList from "./components/UsersList";

const App = () => {

  const userName = localStorage.getItem("userName");

  useEffect(() => {
    socket.emit("join", userName);
  }, [])


  return (
    <div className="flex p-5 gap-5 bg-gray-100 min-h-screen">
      <UsersList />
      <CustomChatUI />
    </div>
  );
};

export default App;