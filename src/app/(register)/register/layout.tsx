import NextTopLoader from "nextjs-toploader";
import { Toaster } from "sonner";
import "../../globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html className="font-graphik">
      <body>
        <NextTopLoader color="#0a778f" />
        {children}
        <Toaster></Toaster>
      </body>
    </html>
  );
}
