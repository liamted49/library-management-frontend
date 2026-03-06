//UserContext.jsx

import { createContext } from "react";

export const UserContext = createContext({
  user: {
    isLoggedIn: false,
    name: '',
    email: '',
    role: ''
  },
  login: () => {},
  logout: () => {}
});