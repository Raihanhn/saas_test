// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { SessionProvider, useSession } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useEffect } from "react";

function AppWrapper({ Component, pageProps }: Pick<AppProps, "Component" | "pageProps">) {
  const { data: session } = useSession();
  const { setRole } = useTheme();

  useEffect(() => {
    if (session?.user?.role) {
      setRole(session.user.role);
    }
  }, [session?.user?.role, setRole]);

  return <Component {...pageProps} />;
}

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <ThemeProvider>
      <SessionProvider session={session} refetchInterval={0}  refetchOnWindowFocus={false} >
        <Toaster position="top-center" reverseOrder={false} />
        <AppWrapper Component={Component} pageProps={pageProps} />
      </SessionProvider>
    </ThemeProvider>
  );
}
