import {BiTask} from "react-icons/bi";
import {PiStudentBold} from "react-icons/pi";
import {SiWikibooks} from "react-icons/si";
import {RiCalendarScheduleLine} from "react-icons/ri";
import {TfiWrite} from "react-icons/tfi";
import {RiMoneyDollarCircleLine} from "react-icons/ri";
import {LiaBookSolid} from "react-icons/lia";
import MenuCard from '../MenuCard';

interface QuickActionsSectionProps {
    onSelectView: (view: string) => void;
}

export const QuickActionsSection = ({onSelectView}: QuickActionsSectionProps) => (
    <section className="quick-actions">
        <div className="menu-grid">
            <MenuCard
                title="Course Plan"
                description="Detailed roadmap."
                icon={<SiWikibooks/>}
                onClick={() => onSelectView('course-plan')}
            />
            <MenuCard
                title="Course Routine"
                description="Weekly class timetable."
                icon={<RiCalendarScheduleLine/>}
                onClick={() => onSelectView('/course-routine')}
            />
            <MenuCard
                title="Enrolled Students"
                description="Complete list of participants."
                icon={<PiStudentBold/>}
                onClick={() => onSelectView('/enrolled-students')}
            />
            <MenuCard
                title="Attendance"
                description="Track daily presence."
                icon={<BiTask/>}
                onClick={() => onSelectView('/course-attendance')}
            />
            <MenuCard
                title="Exam Schedule"
                description="Upcoming test dates."
                icon={<TfiWrite/>}
                onClick={() => onSelectView('/exam-schedule')}
            />
            <MenuCard
                title="Payment"
                description="Collected payment."
                icon={<RiMoneyDollarCircleLine/>}
                onClick={() => onSelectView('/course-payment')}
            />
            <MenuCard
                title="Books & Docs"
                description="Important notes."
                icon={<LiaBookSolid/>}
                onClick={() => onSelectView('/course-notes')}
            />
        </div>
    </section>
);