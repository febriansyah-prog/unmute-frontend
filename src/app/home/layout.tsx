import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unmute By Unifers | Universitas Fajar",
  description: "Program Unmute by Unifers. Sebuah inisiatif dan dedikasi pengabdian masyarakat dari sivitas akademika Universitas Fajar (Unifa) untuk mencetak generasi unggul Sulawesi Selatan melalui eskalasi keterampilan abad 21.",
  openGraph: {
    title: "Unmute By Unifers | Universitas Fajar",
    description: "Program Unmute by Unifers. Sebuah inisiatif dan dedikasi pengabdian masyarakat dari sivitas akademika Universitas Fajar (Unifa) untuk mencetak generasi unggul Sulawesi Selatan melalui eskalasi keterampilan abad 21.",
    siteName: "Unmute By Unifers",
  }
};

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
