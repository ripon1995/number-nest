import './AppPage.css';
import type {ReactNode} from 'react';
import {AppHeader} from './AppHeader';

interface AppPageProps {
    children: ReactNode;
    className?: string;
    headerButtonText?: string;
    headerOnAction?: () => void;
    headerTitle?: string;
    showProfileAvatar?: boolean;
}

export const AppPage = ({
    children,
    className = '',
    headerButtonText,
    headerOnAction,
    headerTitle,
    showProfileAvatar
}: AppPageProps) => (
    <div className={`app-page ${className}`.trim()}>
        <AppHeader
            buttonText={headerButtonText}
            onAction={headerOnAction}
            title={headerTitle}
            showProfileAvatar={showProfileAvatar}
        />
        <div className="app-page-content">
            {children}
        </div>
    </div>
);