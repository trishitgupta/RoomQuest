import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { SearchContextProvider } from "./context/SearchContext";
import { AuthContextProvider } from "./context/AuthContext";
import ToastifyNotification from "./components/ToastifyNotification";


const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <AuthContextProvider>
      <SearchContextProvider>
        <ToastifyNotification/>

        <App />
       
      </SearchContextProvider>
    </AuthContextProvider>
  </React.StrictMode>
);
