import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useTheme } from "../../hooks/useTheme";

export default function TravelLayout({ children, hideFooter = false }) {
    const { theme, isDark, toggleTheme } = useTheme();
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    return (
        <div className="travel-theme" data-theme={theme}>
            <div className="min-h-screen flex flex-col" style={{ background: "var(--tv-bg)", color: "var(--tv-text)" }}>
                <Header isDark={isDark} onToggleTheme={toggleTheme} />
                <main className="flex-1">{children}</main>
                {!hideFooter && <Footer />}
            </div>
        </div>
    );
}
