import Link from "next/link";
import { ArrowRightIcon, LogoMark, UsersIcon } from "@/components/icons";

export default function Home() {
  return (
    <main className="home-main">
      <nav className="home-nav"><span className="brand"><LogoMark /><span>SabaiB</span></span><span className="guest-web-pill">Guest web</span></nav>
      <section className="home-hero">
        <div><p className="eyebrow">SPLIT THE BILL, NOT THE MOOD</p><h1>Fair bills.<br /><em>Sabai sabai.</em></h1><p>Join your group, claim what you ate, and see your exact share—no account required.</p><Link className="primary-button" href="/join/B7X2KP">Try the demo bill <ArrowRightIcon /></Link></div>
        <aside className="invite-preview"><div className="preview-logo"><LogoMark /></div><small>YOU’RE INVITED TO</small><h2>Baan Suan Sathorn</h2><div className="preview-code"><span>Bill code</span><b>B7X2KP</b></div><div className="preview-people"><UsersIcon /><span><b>3 friends joined</b><small>Waiting for you</small></span></div></aside>
      </section>
      <footer className="home-footer">SabaiB guest web · The host creates the bill in the Android app.</footer>
    </main>
  );
}
