// ModalContext.tsx
import React, { createContext, useState, useContext, ReactNode } from "react";

type ModalContextType = {
    isVisible: boolean;
    openModal: () => void;
    closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [isVisible, setIsVisible] = useState(false);
    return (
        <ModalContext.Provider
            value={{
                isVisible,
                openModal: () => setIsVisible(true),
                closeModal: () => setIsVisible(false),
            }}
        >
            {children}
        </ModalContext.Provider>
    );
};

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error("useModal must be used inside ModalProvider");
    return context;
};
