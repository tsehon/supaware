import React, { ReactNode, createContext, useState, useContext } from "react";

/*
Context for managing updates to the chat and data.
*/
const UpdateContext = createContext({
    chatUpdate: false,
    triggerChatUpdate: () => { },
    dataUpdate: false,
    triggerDataUpdate: () => { },
});

// Custom hook for using UpdateContext
export function useUpdate() {
    return useContext(UpdateContext);
}

type UpdateProviderProps = {
    children: ReactNode;
};

/*
Provider for managing updates to the chat and data.
To re-render a component wrapped in UpdateProvider, the component must, according to its needs:
- import { useUpdate } from '../contexts/UpdateContext';
- const { chatUpdate, triggerChatUpdate, dataUpdate, triggerDataUpdate } = useUpdate();
- add chatUpdate and dataUpdate to the dependency array of useEffect

To trigger an update, call triggerChatUpdate() or triggerDataUpdate().
*/
const UpdateProvider: React.FC<UpdateProviderProps> = ({ children }) => {
    const [chatUpdate, setChatUpdate] = useState(false);
    const [dataUpdate, setDataUpdate] = useState(false);

    function triggerChatUpdate() {
        setChatUpdate((prevUpdate) => !prevUpdate);
    }

    function triggerDataUpdate() {
        setDataUpdate((prevUpdate) => !prevUpdate);
    }

    return (
        <UpdateContext.Provider value={{
            chatUpdate, triggerChatUpdate,
            dataUpdate, triggerDataUpdate
        }}>
            {children}
        </UpdateContext.Provider>
    );
}

export default UpdateProvider;