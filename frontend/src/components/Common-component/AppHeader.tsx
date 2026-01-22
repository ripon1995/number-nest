import './AppHeader.css';
import Logo from '../Logo';

interface AppHeaderProps {
    buttonText?: string;
    onAction?: () => void;
    title?: string;
}

export const AppHeader = ({buttonText, onAction, title}: AppHeaderProps) => (
    <header className="app-header">
        <Logo></Logo>
        {title && <h2 className="header-title">{title}</h2>}
        {buttonText && (
            <button className="register-button" onClick={onAction}>
                {buttonText}
            </button>
        )}
    </header>
);