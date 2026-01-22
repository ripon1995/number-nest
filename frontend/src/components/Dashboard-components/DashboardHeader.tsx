import Logo from '../Logo';

interface DashboardHeaderProps {
    onLogout: () => void;
}

export const DashboardHeader = ({onLogout}: DashboardHeaderProps) => (
    <header className="page-header">
        <Logo/>
        <button className="register-button" onClick={onLogout}>
            Logout!
        </button>
    </header>
);