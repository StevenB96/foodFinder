import "../styles/globals.css";
import type {
    AppProps
} from "next/app";
import AuthWrapper from "components/authWrapper";

export default function App({
    Component,
    pageProps: { session, ...pageProps },
}: AppProps) {
    return (
        <AuthWrapper>
            <Component {...pageProps} />
        </AuthWrapper>
    );
};
