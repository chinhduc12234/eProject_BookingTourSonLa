export default function Container({ children, className = "", as: As = "div" }) {
    return <As className={`mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>{children}</As>;
}
