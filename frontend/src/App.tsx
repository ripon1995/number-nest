import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css';
import Dashboard from './components/Dashboard';
import Registration from './components/Registration';
import Login from './components/Login';
import {AppRoutes, PathName} from "./constants/appRoutes.ts";
import CourseDetail from "./components/CourseDetail.tsx";
import Profile from "./components/Profile.tsx";
import ProfileCreation from "./components/ProfileCreation.tsx";
import Students from "./components/Students.tsx";
import StudentDetail from "./components/StudentDetail.tsx";
import About from "./components/About.tsx";
import Contact from "./components/Contact.tsx";
import {CoursePlanView} from "./components/Course-components/CoursePlanView.tsx";
import {CourseInfoView} from "./components/Course-components/CourseInfoView.tsx";
import {CourseAttendanceView} from "./components/Course-components/CourseAttendanceView.tsx";
import {CourseDocsView} from "./components/Course-components/CourseDocsView.tsx";
import {CourseEnrolledStudentsView} from "./components/Course-components/CourseEnrolledStudentsView.tsx";
import {CourseExamScheduleView} from "./components/Course-components/CourseExamScheduleView.tsx";
import {CoursePaymentView} from "./components/Course-components/CoursePaymentView.tsx";
import {CourseRoutineView} from "./components/Course-components/CourseRoutineView.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path={AppRoutes.LOGIN} element={<Login/>}/>
                <Route path={AppRoutes.REGISTER} element={<Registration/>}/>
                <Route path={AppRoutes.DASHBOARD} element={<Dashboard/>}/>
                <Route path={AppRoutes.COURSE_DETAILS} element={<CourseDetail/>}>
                    <Route index element={<CourseInfoView/>}/>
                    <Route path={PathName.PATH_COURSE_PLAN} element={<CoursePlanView/>}/>
                    <Route path={PathName.PATH_COURSE_ATTENDANCE} element={<CourseAttendanceView/>}/>
                    <Route path={PathName.PATH_COURSE_DOCS} element={<CourseDocsView/>}/>
                    <Route path={PathName.PATH_ENROLLED_STUDENTS} element={<CourseEnrolledStudentsView/>}/>
                    <Route path={PathName.PATH_EXAM_SCHEDULE} element={<CourseExamScheduleView/>}/>
                    <Route path={PathName.PATH_COURSE_PAYMENT} element={<CoursePaymentView/>}/>
                    <Route path={PathName.PATH_COURSE_ROUTINE} element={<CourseRoutineView/>}/>
                </Route>
                <Route path={AppRoutes.PROFILE} element={<Profile/>}/>
                <Route path={AppRoutes.PROFILE_CREATE} element={<ProfileCreation/>}/>
                <Route path={AppRoutes.STUDENTS} element={<Students/>}/>
                <Route path={AppRoutes.STUDENT_DETAIL} element={<StudentDetail/>}/>
                <Route path={AppRoutes.ABOUT} element={<About/>}/>
                <Route path={AppRoutes.CONTACT} element={<Contact/>}/>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
