import Logo from '../Logo';

interface AppHeaderProps {
    buttonText: string;
    onAction: () => void;
}

export const AppHeader = ({buttonText, onAction}: AppHeaderProps) => (
    <header className="page-header">
        <Logo/>
        <button className="register-button" onClick={onAction}>
            {buttonText}
        </button>
    </header>
);