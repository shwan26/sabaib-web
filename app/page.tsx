import Link from "next/link";
import { ArrowRightIcon, LogoMark, UsersIcon } from "@/components/icons";
import JoinCodeForm from "@/components/join-code-form";
import { demoBill } from "@/lib/demo-bill";
import { signOut } from "@/app/(auth)/actions";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await getSupabaseServerClient();
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  return (
    <main className="home-main">
      <nav className="home-nav"><span className="brand"><LogoMark /><span>SabaiB</span></span><span className="home-nav-right"><span className="guest-web-pill">Guest web</span><span className="auth-links">{user ? (<><span>{user.email}</span><form action={signOut}><button type="submit">Sign out</button></form></>) : (<><Link href="/login">Sign in</Link><Link href="/signup">Create account</Link></>)}</span></span></nav>
      <section className="home-hero">
        <div>
          <p className="eyebrow">SPLIT THE BILL, NOT THE MOOD</p><h1>Fair bills.<br /><em>Sabai sabai.</em></h1><p>Join your group, claim what you ate, and see your exact share—no account required.</p>
          <div className="cta-panels">
            <div className="cta-panel">
              <p className="cta-panel-title">Just curious?</p>
              <p className="cta-panel-copy">Try a live demo bill with sample friends and dishes—no code needed.</p>
              <Link className="primary-button" href={`/join/${demoBill.code}`}>Try the demo bill <ArrowRightIcon /></Link>
            </div>
            <div className="cta-panel">
              <p className="cta-panel-title">Have a bill code?</p>
              <p className="cta-panel-copy">Your host shared a link or a 6-character code. Enter it to join.</p>
              <JoinCodeForm />
            </div>
          </div>
        </div>
        <aside className="invite-preview"><div className="preview-logo"><LogoMark /></div><small>YOU’RE INVITED TO</small><h2>Baan Suan Sathorn</h2><div className="preview-code"><span>Bill code</span><b>{demoBill.code}</b></div><div className="preview-people"><UsersIcon /><span><b>3 friends joined</b><small>Waiting for you</small></span></div></aside>
      </section>
      <footer className="home-footer">SabaiB guest web · The host creates the bill in the Android app.</footer>
    </main>
  );
}
