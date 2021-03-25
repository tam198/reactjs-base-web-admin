// import './App.css';
import React from "react";
import store from "./redux/store";
import { Provider } from "react-redux";
import Toast from "components/Toast";
import AppNavigator from "./navigation/AppNavigator";

function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Toast />
        <AppNavigator />
      </div>
    </Provider>
  );
}

export default App;
