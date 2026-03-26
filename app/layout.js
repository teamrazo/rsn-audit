import "./globals.css";

export const metadata = {
  title: "Free AI Growth Audit | RazoRSharp Networks",
  description:
    "8 questions. 2 minutes. See where your business is leaking time.",
  icons: {
    icon: "/RS_Only_Purple_Logo_Transparent.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
