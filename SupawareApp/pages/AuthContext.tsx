import React from "react";

type AuthContextType = {
    userToken: string | null;
    signIn: (token: string) => void;
    signOut: () => void;
};

const AuthContext = React.createContext<AuthContextType>({
    userToken: null,
    signIn: () => { },
    signOut: () => { },
});

export default AuthContext;