import Logo from '../Logo';

interface DashboardHeaderProps {
    buttonText: string;
    onAction: () => void;
}

export const DashboardHeader = ({buttonText, onAction}: DashboardHeaderProps) => (
    <header className="page-header">
        <Logo/>
        <button className="register-button" onClick={onAction}>
            {buttonText}
        </button>
    </header>
);