import {IoPersonOutline} from 'react-icons/io5';
import {BiTask} from "react-icons/bi";
import {PiStudentBold} from "react-icons/pi";
import {SiWikibooks} from "react-icons/si";
import {RiCalendarScheduleLine} from "react-icons/ri";
import {TfiWrite} from "react-icons/tfi";
import {RiMoneyDollarCircleLine} from "react-icons/ri";
import {LiaBookSolid} from "react-icons/lia";
import MenuCard from '../MenuCard';
import {AppRoutes} from '../../constants/appRoutes';

interface QuickActionsSectionProps {
    onNavigate: (path: string) => void;
}

export const QuickActionsSection = ({onNavigate}: QuickActionsSectionProps) => (
    <section className="quick-actions">
        <div className="menu-grid">
            <MenuCard
                title="Course Plan"
                description="Detailed roadmap."
                icon={<SiWikibooks/>}
                onClick={() => onNavigate('/course-plan')}
            />
            <MenuCard
                title="Course Routine"
                description="Weekly class timetable."
                icon={<RiCalendarScheduleLine/>}
                onClick={() => onNavigate('/course-routine')}
            />
            <MenuCard
                title="Enrolled Students"
                description="Complete list of participants."
                icon={<PiStudentBold/>}
                onClick={() => onNavigate('/enrolled-students')}
            />
            <MenuCard
                title="Attendance"
                description="Track daily presence."
                icon={<BiTask/>}
                onClick={() => onNavigate('/course-attendance')}
            />
            <MenuCard
                title="Exam Schedule"
                description="Upcoming test dates."
                icon={<TfiWrite/>}
                onClick={() => onNavigate('/exam-schedule')}
            />
            <MenuCard
                title="Payment"
                description="Collected payment."
                icon={<RiMoneyDollarCircleLine/>}
                onClick={() => onNavigate('/course-payment')}
            />
            <MenuCard
                title="Books & Docs"
                description="Important notes."
                icon={<LiaBookSolid/>}
                onClick={() => onNavigate('/course-notes')}
            />


            <MenuCard
                title="My Profile"
                description="View and edit your personal details"
                icon={<IoPersonOutline/>}
                onClick={() => onNavigate(AppRoutes.PROFILE)}
            />

        </div>
    </section>
);