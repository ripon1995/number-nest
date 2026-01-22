import './AppPage.css';
import type {ReactNode} from 'react';
import {AppHeader} from './AppHeader';

interface AppPageProps {
    children: ReactNode;
    className?: string;
    headerButtonText?: string;
    headerOnAction?: () => void;
    headerTitle?: string;
}

export const AppPage = ({
    children,
    className = '',
    headerButtonText,
    headerOnAction,
    headerTitle
}: AppPageProps) => (
    <div className={`app-page ${className}`.trim()}>
        <AppHeader
            buttonText={headerButtonText}
            onAction={headerOnAction}
            title={headerTitle}
        />
        <div className="app-page-content">
            {children}
        </div>
    </div>
);