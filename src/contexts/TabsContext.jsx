import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext();

export const TabsProvider = ({ children }) => {
  const [hasTabsComponent, setHasTabsComponent] = useState(false);

  return (
    <TabsContext.Provider value={{ hasTabsComponent, setHasTabsComponent }}>
      {children}
    </TabsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error("useTabsContext must be used within TabsProvider");
  }
  return context;
};
// if the nav and topbar section comes with eachother it will removes the border bottom of navbar