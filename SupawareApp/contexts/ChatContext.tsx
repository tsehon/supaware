import React, { createContext, useContext, useState } from 'react';

export type Message = {
    id: number;
    text: string;
    timestamp: number;
    isUser: boolean;
};

type ChatContextType = {
    messages: Message[];
    addMessage: (text: string, isUser: boolean) => void;
};

const ChatContext = createContext<ChatContextType>({
    messages: [],
    addMessage: () => { },
});

export const useChatContext = () => useContext(ChatContext);

type ChatProviderProps = {
    children: React.ReactNode;
};

const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [messages, setMessages] = useState<Message[]>([]);

    const addMessage = (text: string, isUser: boolean) => {
        const message: Message = {
            id: messages.length,
            text,
            timestamp: Date.now(),
            isUser,
        };
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    return (
        <ChatContext.Provider value={{ messages, addMessage }}>
            {children}
        </ChatContext.Provider>
    );
};

export default ChatProvider;