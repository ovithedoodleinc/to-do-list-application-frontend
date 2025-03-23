"use client";

import Auth from "@/components/Auth";
import Dashboard from "@/components/Dashboard";
import Loader from "@/components/Loader";
import API from "@/utils/api";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const [state, setState] = useState("loading");
  const [user, setUser] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setState("auth");

      return;
    }

    const getUser = async () => {
      try {
        const res = await API.get("/user", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          setUser(res.data?.user);
          setState("dashboard");
        } else {
          localStorage.removeItem("token");

          setState("auth");
        }
      } catch (err) {
        console.log("🚀 ~ getUser ~ err:", err);

        localStorage.removeItem("token");

        setState("auth");
      }
    };

    getUser();
  }, []);

  return state === "loading" ? (
    <Loader />
  ) : state === "dashboard" ? (
    <Dashboard user={user} setUser={setUser} setState={setState} />
  ) : (
    <Auth setState={setState} setUser={setUser} />
  );
}
