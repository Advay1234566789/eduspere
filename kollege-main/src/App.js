import { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Context
import { UserProvider } from "./Hooks/UserContext";

// Components and layouts
import Loading from "./Components/Layouts/Loading";
import AppLayout from "./Components/Layouts/AppLayout";
import Layout from "./Components/Layouts/Layout";
import Dash from "./Components/Layouts/Dash";
import ErrorElement from "./Components/Layouts/ErrorElement";
import AttendanceLayout from "./Components/Layouts/AttendanceLayout";
import InternalLayout from "./Components/Layouts/InternalLayout";
import RegisterLayout from "./Components/Layouts/RegisterLayout";

// Queries
import Paper from "./Components/Queries/Paper";
import Notes from "./Components/Queries/Notes";
import StudentsList from "./Components/Queries/StudentsList";
import Profile from "./Components/Queries/Profile";
import ClubManagement from "./Components/Queries/ClubManagement";
import InternalStudent from "./Components/Queries/InternalStudent" // Note the casing
import MessManagement from "./Components/Queries/MessManagement"
import BookingSystem  from "./Components/Queries/BookingSystem"
import TeacherRequest  from "./Components/Queries/TeacherRequest"
import StudentCheating from "./Components/Queries/StudentCheating"
import TeacherRecord from "./Components/Queries/TeacherRecord"
import ClubApproval from "./Components/Queries/ClubApproval"
import TransationApplication from "./Components/Queries/TransationApplication"
import TransationAcception from "./Components/Queries/TransationAcception"
import MessBudgate from "./Components/Queries/MessBudgate"
import DoctorAdvice from "./Components/Queries/DoctorAdvice"
import DoctorProfile  from "./Components/Queries/DoctorProfile"
import TeacherIntegernal  from "./Components/Queries/TeacherIntegernal"
// Forms
import StaffForm from "./Components/Forms/StaffForm";
import StudentForm from "./Components/Forms/StudentForm";
import NotesForm from "./Components/Forms/NotesForm";

import Login from "./Components/Forms/Login";

// Lazy-loaded user-specific components
const StaffApproval = lazy(() =>
  import("./Components/Queries/StaffApproval").then(module => ({ default: module.StaffApproval }))
);

const PaperForm = lazy(() => import("./Components/Forms/PaperForm"));
const JoinPaper = lazy(() => import("./Components/Forms/JoinPaper"));

function App() {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<AppLayout />} errorElement={<ErrorElement />}>
        <Route index element={<Login />} />
        <Route path="/register" element={<RegisterLayout />}>
          <Route path="reg_staff" element={<StaffForm />} />
          <Route path="reg_student" element={<StudentForm />} />
        </Route>
        <Route
          path="/dash"
          element={<Layout />}
          errorElement={<ErrorElement />}
        >
          <Route index element={<Dash />} />
          <Route path="paper" element={<Paper />} />
          <Route path="paper/:paper" element={<Notes />} />
          <Route path="paper/:paper/add" element={<NotesForm />} />
          <Route path="paper/:paper/:note/edit" element={<NotesForm />} />
          <Route path="paper/:paper/students" element={<StudentsList />} />
          <Route path="attendance" element={<AttendanceLayout />} />
          <Route path="internal" element={<InternalStudent />} />
          <Route path="internalMarks" element={<TeacherIntegernal />} />

          {/* <Route path="time_schedule" element={<TimeScheduleForm />} /> */}
          <Route path="profile" element={<Profile />} />
          <Route path="club_management" element={<ClubManagement />} />

          <Route path="messmanagement" element={<MessManagement />} />
          <Route path="bookingsystem" element={<BookingSystem />} />
          <Route path="teacher_request_acceptance" element={<TeacherRequest />} />
          <Route path="cheatingRecord" element={<TeacherRecord />} />
          <Route path="showCheating" element={<StudentCheating />} />
          <Route path="club_approval" element={<ClubApproval />} />
          {/* <Route path="doctorProfile" element={<TeacherIntegernal />} /> */}
          <Route path="transactionRequest" element={<TransationApplication />} />
          <Route path="transactionAcception" element={<TransationAcception />} />
          <Route path="messmanagementTeacher" element={<MessBudgate />} />
          <Route path="doctorPatients" element={<DoctorAdvice />} />
          <Route path="doctorProfile" element={<DoctorProfile />} />
      
          <Route
            path="approve_staff"
            element={
              <Suspense fallback={<Loading />}>
                <StaffApproval />
              </Suspense>
            }

          />
           <Route
            path="approve_staff"
            element={
              <Suspense fallback={<Loading />}>
                <StaffApproval />
              </Suspense>
            }
            
          />
          <Route
            path="add_paper"
            element={
              <Suspense fallback={<Loading />}>
                <PaperForm />
              </Suspense>
            }
          />
          <Route
            path="join_paper"
            element={
              <Suspense fallback={<Loading />}>
                <JoinPaper />
              </Suspense>
            }
          />
        </Route>
      </Route>
    )
  );

  return (
    <UserProvider>
      <RouterProvider router={router} />
      <ToastContainer
        className="toast"
        toastClassName="toast-rounded"
        bodyClassName="toast-body"
        position="bottom-right"
        autoClose={5000}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        hideProgressBar={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </UserProvider>
  );
}

export default App;
