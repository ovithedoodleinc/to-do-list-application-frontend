import API from "@/utils/api";
import { useState } from "react";

export default function Auth({ setState, setUser }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setState("loading");

    try {
      if (form.email.length < 12) {
        throw "too short email";
      }

      if (form.password.length < 4) {
        throw "too short password";
      }

      if (isSignUp) {
        if (form.name.length < 3 || form.name.length > 32) {
          throw "too short or big name";
        }

        await API.post("/auth/signup", form);
      }

      const res = await API.post("/auth/login", form);

      if (res.status === 200) {
        localStorage.setItem("token", res.data?.token);

        setUser(res.data?.user);
        setState("dashboard");
      }
    } catch (err) {
      console.log("🚀 ~ handleSubmit ~ error:", err);

      setState("auth");

      alert(err.response?.data?.message || err || "error");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold text-center">
          {isSignUp ? "Sign Up" : "Sign In"}
        </h2>
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <input
              name="name"
              type="text"
              placeholder="Name"
              className="border rounded-md w-full mt-3 py-2 px-4"
              onChange={handleChange}
              required
            />
          )}
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="border rounded-md w-full mt-3 py-2 px-4"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="border rounded-md w-full mt-3 py-2 px-4"
            onChange={handleChange}
            required
          />
          <input
            type="submit"
            value={isSignUp ? "Sign Up" : "Sign In"}
            className="border w-full py-1 px-4 rounded-md mt-4 bg-black text-white font-bold cursor-pointer hover:bg-white hover:text-black transition-all"
          />
        </form>
        <p className="text-center mt-3">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}
        </p>
        <p
          className="text-blue-500 cursor-pointer text-center font-semibold"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? " Sign In" : " Sign Up"}
        </p>
      </div>
    </div>
  );
}
