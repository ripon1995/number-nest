import {BiTask} from "react-icons/bi";
import {PiStudentBold} from "react-icons/pi";
import {SiWikibooks} from "react-icons/si";
import {RiCalendarScheduleLine} from "react-icons/ri";
import {TfiWrite} from "react-icons/tfi";
import {RiMoneyDollarCircleLine} from "react-icons/ri";
import {LiaBookSolid} from "react-icons/lia";
import MenuCard from '../MenuCard';
import {AppRoutes} from "../../constants/appRoutes.ts";

interface QuickActionsSectionProps {
    onNavigate: (path: string) => void;
    courseId: string | undefined;
}

export const QuickActionsSection = ({onNavigate, courseId}: QuickActionsSectionProps) => (
    <section className="quick-actions">
        <div className="menu-grid">
            <MenuCard
                title="Course Plan"
                description="Detailed roadmap."
                icon={<SiWikibooks/>}
                onClick={() => courseId && onNavigate(AppRoutes.getCoursePlanPath(courseId))}
            />
            <MenuCard
                title="Course Routine"
                description="Weekly class timetable."
                icon={<RiCalendarScheduleLine/>}
                onClick={() => courseId && onNavigate(AppRoutes.getCourseRoutinePath(courseId))}
            />
            <MenuCard
                title="Enrolled Students"
                description="Complete list of participants."
                icon={<PiStudentBold/>}
                onClick={() => courseId && onNavigate(AppRoutes.getCourseEnrolledStudentsPath(courseId))}
            />
            <MenuCard
                title="Attendance"
                description="Track daily presence."
                icon={<BiTask/>}
                onClick={() => courseId && onNavigate(AppRoutes.getCourseAttendancePath(courseId))}
            />
            <MenuCard
                title="Exam Schedule"
                description="Upcoming test dates."
                icon={<TfiWrite/>}
                onClick={() => courseId && onNavigate(AppRoutes.getCourseExamSchedulePath(courseId))}
            />
            <MenuCard
                title="Payment"
                description="Collected payment."
                icon={<RiMoneyDollarCircleLine/>}
                onClick={() => courseId && onNavigate(AppRoutes.getCoursePaymentPath(courseId))}
            />
            <MenuCard
                title="Books & Docs"
                description="Important notes."
                icon={<LiaBookSolid/>}
                onClick={() => courseId && onNavigate(AppRoutes.getCourseDocsPath(courseId))}
            />
        </div>
    </section>
);