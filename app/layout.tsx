import './globals.css';
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'ZYRANEXT Labs', description: 'AI growth platform for creators, streamers, VTubers and teams.' };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
