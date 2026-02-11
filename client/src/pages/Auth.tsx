import React, { useState } from "react";
import { login, signup } from "../api/auth";

interface Props {
  onAuthSuccess: () => void;
}

const Auth: React.FC<Props> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      isLogin
        ? await login(email, password)
        : await signup(email, password);
      onAuthSuccess();
    } catch {
      setError("Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#0f172a]">
      <div className="w-96 bg-slate-900 p-8 rounded-xl border border-slate-700">
        <h1 className="text-2xl font-bold text-indigo-400 mb-6 text-center">
          EchoMind
        </h1>

        <input
          className="w-full mb-3 p-2 rounded bg-slate-800 border border-slate-700"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full mb-4 p-2 rounded bg-slate-800 border border-slate-700"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        <button
          onClick={submit}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-500 py-2 rounded font-medium"
        >
          {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
        </button>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-xs text-slate-400 hover:text-slate-200 w-full"
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
};

export default Auth;
