// "use client";
// import { useContext, useState, useEffect } from "react";
// import { useNavigate, Navigate } from "react-router-dom";
// import UserContext from "../../Hooks/UserContext";
// import axios from "../../config/api/axios";
// import { FaUniversity } from "react-icons/fa";
// import { PiStudentThin, PiUserThin, PiSpinnerGapBold } from "react-icons/pi";
// import CircleDesign from "../Layouts/CircleDesign";
// import ErrorStrip from "../ErrorStrip";

// const Login = () => {
//   const navigate = useNavigate();
//   const { user, setUser } = useContext(UserContext);
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [userType, setUserType] = useState("");
//   const [error, setError] = useState("");
//   const [buttonText, setButtonText] = useState("Login");
//   const [message, setMessage] = useState("");

//   const slowLoadingIndicator = () => {
//     setTimeout(() => {
//       setMessage(
       
//       );
//     }, 9000);
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     if (userType === "") {
//       setError({
//         response: {
//           data: "Select User Type",
//         },
//       });
//     } else {
//       setButtonText("Loading...");
//       slowLoadingIndicator();
//       try {
//         const response = await axios.post("/auth/login/" + userType, {
//           username,
//           password,
//         });
//         // Here we merge the response with the userType.
//         // Make sure the backend returns an object that allows you to distinguish teachers.
//         await setUser({ ...response.data, userType });
//         localStorage.setItem(
//           "userDetails",
//           JSON.stringify({ ...response.data, userType })
//         );
//       } catch (err) {
//         setError(err);
//         setButtonText("Login");
//       }
//     }
//   };

//   useEffect(() => {
//     if (localStorage.getItem("userDetails")) {
//       setUser(JSON.parse(localStorage.getItem("userDetails")));
//     }
//     setUserType("");
//     setMessage("");
//   }, [setUser, setUserType, setMessage]);

//   const BottomGradient = () => {
//     return (
//       <>
//         <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
//         <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
//       </>
//     );
//   };

//   return (
//     <>
//       {!user ? (
//         <main className="relative z-0 flex h-screen flex-col items-center justify-center bg-slate-950 text-slate-200">
//           {message && !error && (
//             <header className="absolute top-0 w-full bg-slate-800/50 p-2 text-xs lg:text-base">
//               {message}
//             </header>
//           )}
//           <CircleDesign />
//           <section className="z-0 mb-8 flex items-center gap-2 whitespace-nowrap text-6xl md:text-8xl lg:gap-4">
//             <FaUniversity className="text-violet-400" />
//             <h1 className="font-spectral font-semibold text-slate-200">
              
//               {/* <span className="inline-block h-10 w-10 rounded-full bg-violet-600 md:h-14 md:w-14 xl:h-14 xl:w-14"></span> */}
//               Eduspehre
//             </h1>
//           </section>

//           <div className="max-w-md w-full mx-auto rounded-2xl p-8 bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50">
//             <h2 className="font-bold text-xl text-slate-200">
//               Welcome Back
//             </h2>
//             <p className="text-slate-400 text-sm max-w-sm mt-2">
//               Please login to your account to continue
//             </p>

//             <form className="mt-8" onSubmit={handleLogin}>
//               <div className="flex space-x-4 mb-6">
//                 <button
//                   type="button"
//                   className={`relative group/btn flex-1 h-12 rounded-lg border border-slate-800 ${
//                     userType === "staff"
//                       ? "bg-violet-600 text-white border-violet-500"
//                       : "bg-slate-800 text-slate-300 hover:bg-slate-700"
//                   } transition-all duration-200`}
//                   onClick={() => setUserType("staff")}
//                 >
//                   <div className="flex items-center justify-center space-x-2">
//                     <PiUserThin className="h-6 w-6" />
//                     <span>Staff</span>
//                   </div>
//                   <BottomGradient />
//                 </button>
//                 <button
//                   type="button"
//                   className={`relative group/btn flex-1 h-12 rounded-lg border border-slate-800 ${
//                     userType === "student"
//                       ? "bg-violet-600 text-white border-violet-500"
//                       : "bg-slate-800 text-slate-300 hover:bg-slate-700"
//                   } transition-all duration-200`}
//                   onClick={() => setUserType("student")}
//                 >
//                   <div className="flex items-center justify-center space-x-2">
//                     <PiStudentThin className="h-6 w-6" />
//                     <span>Student</span>
//                   </div>
//                   <BottomGradient />
//                 </button>
//               </div>

//               {userType ? (
//                 <>
//                   <div className="space-y-4">
//                     <div className="space-y-2">
//                       <label
//                         htmlFor="username"
//                         className="block text-sm font-medium text-slate-200"
//                       >
//                         Username
//                       </label>
//                       <input
//                         id="username"
//                         placeholder="Enter your username"
//                         type="text"
//                         required
//                         value={username}
//                         onChange={(e) => setUsername(e.target.value)}
//                         className="w-full h-12 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <label
//                         htmlFor="password"
//                         className="block text-sm font-medium text-slate-200"
//                       >
//                         Password
//                       </label>
//                       <input
//                         id="password"
//                         placeholder="••••••••"
//                         type="password"
//                         required
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         className="w-full h-12 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
//                       />
//                     </div>
//                   </div>

//                   <button
//                     className="relative group/btn mt-8 bg-gradient-to-br from-violet-600 to-violet-800 w-full text-white rounded-lg h-12 font-medium shadow-lg hover:from-violet-500 hover:to-violet-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
//                     type="submit"
//                     disabled={buttonText !== "Login"}
//                   >
//                     <div className="flex items-center justify-center space-x-2">
//                       {buttonText !== "Login" && (
//                         <PiSpinnerGapBold className="animate-spin" />
//                       )}
//                       <span>{buttonText}</span>
//                     </div>
//                   </button>
//                 </>
//               ) : (
//                 <p className="w-full bg-slate-800 rounded-lg p-4 text-center text-slate-300 border border-slate-700">
//                   Select User Type to Continue
//                 </p>
//               )}
//               {error && <ErrorStrip error={error} />}
//               <div className="mt-6 text-center">
//                 <span className="text-slate-400">
//                   Don't have an account?{" "}
//                 </span>
//                 <button
//                   type="button"
//                   className="font-semibold text-violet-400 hover:text-violet-300 transition-colors duration-200"
//                   onClick={() => navigate("./register/reg_student")}
//                 >
//                   Register here
//                 </button>
//               </div>
//             </form>
//           </div>
//         </main>
//       ) : (
//         <Navigate to="./dash" />
//       )}
//     </>
//   );
// };

// export default Login;
"use client";
import { useContext, useState, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import UserContext from "../../Hooks/UserContext";
import axios from "../../config/api/axios";
import { FaUniversity, FaUserMd } from "react-icons/fa";
import { PiStudentThin, PiUserThin, PiSpinnerGapBold } from "react-icons/pi";
import CircleDesign from "../Layouts/CircleDesign";
import ErrorStrip from "../ErrorStrip";

const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("");
  const [error, setError] = useState("");
  const [buttonText, setButtonText] = useState("Login");
  const [message, setMessage] = useState("");

  const slowLoadingIndicator = () => {
    setTimeout(() => {
      setMessage("This is taking longer than usual, please wait...");
    }, 9000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (userType === "") {
      setError({ response: { data: "Select User Type" } });
    } else if (userType === "doctor") {
      // Built-in credentials for doctor login
      setButtonText("Loading...");
      slowLoadingIndicator();
      // Hard-coded doctor credentials (change these as required)
      if (username === "doctor" && password === "doctor") {
        setUser({ _id: "doctor-id", username, role: "doctor" });
        localStorage.setItem(
          "userDetails",
          JSON.stringify({ _id: "doctor-id", username, role: "doctor" })
        );
        setButtonText("Login");
      } else {
        setError({ response: { data: "Invalid doctor credentials" } });
        setButtonText("Login");
      }
    } else {
      setButtonText("Loading...");
      slowLoadingIndicator();
      try {
        const response = await axios.post("/auth/login/" + userType, {
          username,
          password,
        });
        await setUser({ ...response.data, userType });
        localStorage.setItem(
          "userDetails",
          JSON.stringify({ ...response.data, userType })
        );
      } catch (err) {
        setError(err);
        setButtonText("Login");
      }
    }
  };

  useEffect(() => {
    if (localStorage.getItem("userDetails")) {
      setUser(JSON.parse(localStorage.getItem("userDetails")));
    }
    setUserType("");
    setMessage("");
  }, [setUser]);

  const BottomGradient = () => {
    return (
      <>
        <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
        <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
      </>
    );
  };

  return (
    <>
      {!user ? (
        <main className="relative z-0 flex h-screen flex-col items-center justify-center bg-slate-950 text-slate-200">
          {message && !error && (
            <header className="absolute top-0 w-full bg-slate-800/50 p-2 text-xs lg:text-base">
              {message}
            </header>
          )}
          <CircleDesign />
          <section className="z-0 mb-8 flex items-center gap-2 whitespace-nowrap text-6xl md:text-8xl lg:gap-4">
            <FaUniversity className="text-violet-400" />
            <h1 className="font-spectral font-semibold text-slate-200">
              Edusphere
            </h1>
          </section>

          <div className="max-w-md w-full mx-auto rounded-2xl p-8 bg-slate-900 border border-slate-800 shadow-2xl shadow-black/50">
            <h2 className="font-bold text-xl text-slate-200">Welcome Back</h2>
            <p className="text-slate-400 text-sm max-w-sm mt-2">
              Please login to your account to continue
            </p>

            <form className="mt-8" onSubmit={handleLogin}>
              <div className="flex space-x-4 mb-6">
                <button
                  type="button"
                  className={`relative group/btn flex-1 h-12 rounded-lg border border-slate-800 ${
                    userType === "staff"
                      ? "bg-violet-600 text-white border-violet-500"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  } transition-all duration-200`}
                  onClick={() => setUserType("staff")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PiUserThin className="h-6 w-6" />
                    <span>Staff</span>
                  </div>
                  <BottomGradient />
                </button>
                <button
                  type="button"
                  className={`relative group/btn flex-1 h-12 rounded-lg border border-slate-800 ${
                    userType === "student"
                      ? "bg-violet-600 text-white border-violet-500"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  } transition-all duration-200`}
                  onClick={() => setUserType("student")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <PiStudentThin className="h-6 w-6" />
                    <span>Student</span>
                  </div>
                  <BottomGradient />
                </button>
                <button
                  type="button"
                  className={`relative group/btn flex-1 h-12 rounded-lg border border-slate-800 ${
                    userType === "doctor"
                      ? "bg-violet-600 text-white border-violet-500"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  } transition-all duration-200`}
                  onClick={() => setUserType("doctor")}
                >
                  <div className="flex items-center justify-center space-x-2">
                    <FaUserMd className="h-6 w-6" />
                    <span>Doctor</span>
                  </div>
                  <BottomGradient />
                </button>
              </div>

              {userType ? (
                <>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label htmlFor="username" className="block text-sm font-medium text-slate-200">
                        Username
                      </label>
                      <input
                        id="username"
                        placeholder="Enter your username"
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="password" className="block text-sm font-medium text-slate-200">
                        Password
                      </label>
                      <input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-12 px-4 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
                      />
                    </div>
                  </div>

                  <button
                    className="relative group/btn mt-8 bg-gradient-to-br from-violet-600 to-violet-800 w-full text-white rounded-lg h-12 font-medium shadow-lg hover:from-violet-500 hover:to-violet-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                    type="submit"
                    disabled={buttonText !== "Login"}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      {buttonText !== "Login" && <PiSpinnerGapBold className="animate-spin" />}
                      <span>{buttonText}</span>
                    </div>
                  </button>
                </>
              ) : (
                <p className="w-full bg-slate-800 rounded-lg p-4 text-center text-slate-300 border border-slate-700">
                  Select User Type to Continue
                </p>
              )}
              {error && <ErrorStrip error={error} />}
              <div className="mt-6 text-center">
                <span className="text-slate-400">Don't have an account? </span>
                <button
                  type="button"
                  className="font-semibold text-violet-400 hover:text-violet-300 transition-colors duration-200"
                  onClick={() => navigate("./register/reg_student")}
                >
                  Register here
                </button>
              </div>
            </form>
          </div>
        </main>
      ) : (
        <Navigate to="./dash" />
      )}
    </>
  );
};

export default Login;
