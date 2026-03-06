//You can modify this component.

import { useRef, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function Login() {

  const [controlState, setControlState] = useState({
    isLoggingIn: false,
    isLoginError: false,
    isLoginOk: false
  });

  const emailRef = useRef();
  const passRef = useRef();
  const {user, login} = useUser();

  async function onLogin () {

    setControlState((prev)=>{
      return {
        ...prev,
        isLoggingIn: true
      }
    });

    const email = emailRef.current.value;
    const pass = passRef.current.value;

    const result = await login(email, pass);

    setControlState((prev) => {
      return {
        isLoggingIn: false,
        isLoginError: !result,
        isLoginOk: result
      }
    });
  }

  if (!user.isLoggedIn)
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>📚 Library Management</h1>
            <p>Sign In to Your Account</p>
          </div>

          <form className="login-form" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input 
                type="email" 
                id="email" 
                ref={emailRef}
                placeholder="user@test.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input 
                type="password" 
                id="password" 
                ref={passRef}
                placeholder="Enter your password"
                required
              />
            </div>

            {controlState.isLoginError && (
              <div className="alert alert-error">
                ❌ Email or password is incorrect
              </div>
            )}

            {controlState.isLoginOk && (
              <div className="alert alert-success">
                ✅ Login successful! Redirecting...
              </div>
            )}

            <button 
              type="submit" 
              className="login-button"
              disabled={controlState.isLoggingIn}
            >
              {controlState.isLoggingIn ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <div className="login-footer">
            <p>Test Credentials:</p>
            <div className="test-users">
              <div className="user-info">
                <strong>Admin:</strong> admin@test.com / admin123
              </div>
              <div className="user-info">
                <strong>User:</strong> user@test.com / user123
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  else
    return (
      <Navigate to="/profile" replace />
    );
}