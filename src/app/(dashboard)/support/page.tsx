"use client"; // This makes the component a Client Component

import { useState } from "react";

const SupportPage = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! How can I assist you?", sender: "support" },
    { id: 2, text: "I need help with my order.", sender: "user" },
  ]);

  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: "user" }]);
    setInput(""); // Clear input after sending
  };

  return (
    <div className="p-4 flex gap-4 flex-col md:flex-row min-h-screen">
      {/* LEFT PANEL - Chat List */}
      <div className="w-full h-full lg:w-1/3 flex flex-col gap-8">
        <ChatList />
      </div>

      {/* RIGHT PANEL - Chat Window and Input */}
      <div className="w-full h-full lg:w-2/3 flex flex-col gap-4">
        <ChatWindow messages={messages} />
        <ChatInput input={input} setInput={setInput} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

// Chat List Component
const ChatList = () => {
  const chats = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "John Doe" },
    { id: 4, name: "Jane Smith" },
    { id: 5, name: "John Doe" },
    { id: 6, name: "Jane Smith" },
    { id: 7, name: "John Doe" },
    { id: 8, name: "Jane Smith" },
  ];

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-lg font-semibold mb-4">Support Chats</h2>
      <ul>
        {chats.map((chat) => (
          <li key={chat.id} className="p-2 hover:bg-gray-100 cursor-pointer">
            {chat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Chat Window Component
interface Message {
  id: number;
  text: string;
  sender: string;
}

const ChatWindow = ({ messages }: { messages: Message[] }) => {
  return (
    <div className="w-full h-[450px] border rounded-lg shadow-md bg-white p-4 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Chat</h2>
      <div className="flex flex-col gap-2">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg w-fit max-w-[70%] ${
              msg.sender === "user" ? "bg-color1 text-white self-end" : "bg-color1lite text-black self-start"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// Chat Input Component
interface ChatInputProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  sendMessage: () => void;
}

const ChatInput = ({ input, setInput, sendMessage }: ChatInputProps) => {
  return (
    <div className="flex items-center border rounded-lg shadow-md bg-white p-2">
      <input
        type="text"
        className="flex-grow p-2 outline-none"
        placeholder="Type a message..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
      />
      <button className="bg-color1 text-white px-4 py-2 rounded-lg" onClick={sendMessage}>
        Send
      </button>
    </div>
  );
};

export default SupportPage;
