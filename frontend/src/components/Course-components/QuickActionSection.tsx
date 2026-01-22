import {IoPersonOutline, IoSettingsOutline, IoHelpCircleOutline} from 'react-icons/io5';
import MenuCard from '../MenuCard';
import {AppRoutes} from '../../constants/appRoutes';

interface QuickActionsSectionProps {
    onNavigate: (path: string) => void;
}

export const QuickActionsSection = ({onNavigate}: QuickActionsSectionProps) => (
    <section className="quick-actions">
        <hr className="section-divider"/>
        <h2 className="section-title">Quick Actions</h2>
        <div className="menu-grid">
            <MenuCard
                title="My Profile"
                description="View and edit your personal details"
                icon={<IoPersonOutline/>}
                onClick={() => onNavigate(AppRoutes.PROFILE)}
            />
            <MenuCard
                title="Settings"
                description="Account and notification preferences"
                icon={<IoSettingsOutline/>}
                onClick={() => onNavigate('/settings')}
            />
            <MenuCard
                title="Help Center"
                description="FAQs and student support"
                icon={<IoHelpCircleOutline/>}
                onClick={() => onNavigate('/help')}
            />
        </div>
    </section>
);