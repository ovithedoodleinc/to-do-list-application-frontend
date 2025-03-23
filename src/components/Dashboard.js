import globe from "@/assets/svg/globe.svg";
import API from "@/utils/api";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Dashboard({ user, setUser, setState }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [image, setImage] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setState("auth");
    }

    const getTasks = async () => {
      try {
        const res = await API.get("/tasks", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 200) {
          setTasks(res.data?.tasks);
        }
      } catch (err) {
        console.log("🚀 ~ useEffect ~ err:", err);

        setState("auth");
      }
    };

    getTasks();
  }, [setState]);

  const handleAddTask = async () => {
    if (!newTask) {
      alert("please add a task");

      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await API.post(
        "/tasks",
        { title: newTask },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.status === 201) {
        setTasks([...tasks, res.data?.task]);
        setNewTask("");
      }
    } catch (err) {
      console.log("🚀 ~ addTask ~ err:", err);
    }
  };

  const handleUploadProfilePic = async () => {
    if (!image) {
      alert("no file selected");

      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      formData.append("profilePic", image);

      const res = await API.post("/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.status === 200) {
        setUser({ ...user, profilePic: res.data?.profilePic });
        setImage(null);
        handleResetFileInput();
      }
    } catch (err) {
      console.log("🚀 ~ uploadProfilePic ~ err:", err);
    }
  };

  const handleResetFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleMarkAsCompleted = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.patch(
        "/tasks",
        { id: taskId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        const restTasks = tasks.filter((item) => item._id !== taskId);

        setTasks([...restTasks, res.data?.task]);
      }
    } catch (err) {
      console.log("🚀 ~ handleMarkAsCompleted ~ err:", err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.delete("/tasks", {
        data: { id: taskId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        const restTasks = tasks.filter((item) => item._id !== taskId);

        setTasks(restTasks);
      }
    } catch (err) {
      console.log("🚀 ~ handleDeleteTask ~ err:", err);
    }
  };

  const handleEditTask = (taskId, taskTitle) => {
    setIsEdit(true);
    setNewTask(taskTitle);
    setEditId(taskId);
  };

  const handleUpdateTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await API.patch(
        "/tasks",
        { id: editId, title: newTask },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.status === 200) {
        const theTaskIndex = tasks.findIndex((item) => item._id === editId);
        const allTasks = [...tasks];

        allTasks.splice(theTaskIndex, 1, res.data?.task);

        setTasks(allTasks);
        setNewTask("");
        setIsEdit(false);
      }
    } catch (err) {
      console.log("🚀 ~ handleUpdateTask ~ err:", err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
      <div className="p-6 m-6 bg-white rounded-lg shadow-md min-w-[50%] min-h-[50%]">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <p className="font-bold">{user?.name || "USER"}</p>
            <button
              onClick={() => {
                setState("loading");
                setTimeout(() => {
                  localStorage.removeItem("token");
                  setUser({});
                  setState("auth");
                }, 1000);
              }}
              className="hover:bg-red-500 px-2 py-1 rounded-sm hover:text-white font-bold border border-red-500 bg-white text-red-500 transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
        <div className="mt-6 flex items-center">
          <Image
            src={
              user?.profilePic
                ? `${process.env.NEXT_PUBLIC_API_URL}/upload/${user?.profilePic}`
                : globe
            }
            className="w-16 h-16 rounded-full border object-cover"
            width={160}
            height={160}
            alt="default-avatar.png"
          />
          <input
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
            className="ml-4 border border-gray-500 px-2 py-1 rounded-sm file:text-gray-500 file:font-bold cursor-pointer"
            accept="image/*"
            ref={fileInputRef}
          />
          <button
            className="ml-2 hover:bg-gray-500 px-2 py-1 rounded-sm hover:text-white font-bold border border-gray-500 bg-white text-gray-500 transition-all cursor-pointer"
            onClick={handleUploadProfilePic}
          >
            Upload
          </button>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-bold">Your Tasks</h2>
          {isEdit ? (
            <div className="flex mt-3">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New Task"
                className="px-1.5 py-0.5 border rounded-sm w-full"
              />
              <button
                className="ml-2 hover:bg-blue-500 px-2 py-1 rounded-sm hover:text-white font-bold border border-blue-500 bg-white text-blue-500 transition-all cursor-pointer"
                onClick={handleUpdateTask}
              >
                Update
              </button>
            </div>
          ) : (
            <div className="flex mt-3">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="New Task"
                className="px-1.5 py-0.5 border rounded-sm w-full"
              />
              <button
                className="ml-2 hover:bg-green-500 px-2 py-1 rounded-sm hover:text-white font-bold border border-green-500 bg-white text-green-500 transition-all cursor-pointer"
                onClick={handleAddTask}
              >
                Add
              </button>
            </div>
          )}
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-bold">Current Tasks</h3>
            <ul className="mt-2">
              {tasks.length > 0 ? (
                tasks
                  ?.filter((item) => !item.completed)
                  ?.map((task) => (
                    <li key={task._id} className="p-1 flex justify-between">
                      <div className="flex gap-2 items-center">
                        <input
                          title="mark as completed"
                          onChange={() => handleMarkAsCompleted(task._id)}
                          type="checkbox"
                        />
                        <span>{task.title}</span>
                        <span className="text-xs">
                          {new Intl.DateTimeFormat("en-CA").format(
                            new Date(task.createdAt)
                          )}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTask(task._id, task.title)}
                          className="text-xs font-semibold border-blue-500 border px-1 rounded-sm text-blue-500 hover:text-white hover:bg-blue-500 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-xs font-semibold border-black border px-1 rounded-sm text-black hover:text-white cursor-pointer hover:bg-black"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))
              ) : (
                <p>No tasks</p>
              )}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold">Completed Tasks</h3>
            <ul className="mt-2">
              {tasks.length > 0 ? (
                tasks
                  ?.filter((item) => item.completed)
                  ?.map((task) => (
                    <li
                      key={task._id}
                      className="p-1 flex gap-2 justify-between"
                    >
                      <div className="flex gap-2 items-center">
                        <input
                          checked
                          disabled
                          onChange={() => handleMarkAsCompleted(task._id)}
                          type="checkbox"
                        />
                        <span className="line-through">{task.title}</span>
                        <span className="text-xs">
                          {new Intl.DateTimeFormat("en-CA").format(
                            new Date(task.completedAt)
                          )}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditTask(task._id, task.title)}
                          className="text-xs font-semibold border-blue-500 border px-1 rounded-sm text-blue-500 hover:text-white hover:bg-blue-500 cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="text-xs font-semibold border-black border px-1 rounded-sm text-black cursor-pointer hover:text-white hover:bg-black"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))
              ) : (
                <p>No tasks</p>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
