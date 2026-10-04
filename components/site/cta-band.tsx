import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/** The closing call to action: the brand gradient, one sentence, one button. */
export function CtaBand({ title, accent, after, subtitle, button, href }: { title: string; accent?: string; after?: string; subtitle: string; button: string; href: string }) {
    return (
        <section className="pb-20 lg:pb-28">
            <div className="container-page">
                <div className="reveal relative isolate overflow-hidden rounded-[2rem] bg-[linear-gradient(125deg,#4338ca_0%,#6d3fe6_38%,#d0409a_78%,#ff8f4a_118%)] px-7 py-16 text-center text-white shadow-xl sm:px-12 sm:py-24">
                    <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_90%_at_50%_-10%,rgb(255_255_255/0.28),transparent)]" />
                    <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000,transparent)]" />
                    <h2 className="mx-auto max-w-3xl font-display text-[2rem] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
                        {title}{accent && <> <span className="italic opacity-95">{accent}</span></>}{after && <> {after}</>}
                    </h2>
                    <p className="mx-auto mt-5 max-w-lg text-lg text-white/85">{subtitle}</p>
                    <Link href={href} className="btn btn-lg mt-9 bg-white text-[#1a1640] shadow-lg hover:-translate-y-0.5 hover:bg-white/95">
                        {button} <ArrowRight />
                    </Link>
                </div>
            </div>
        </section>
    );
}
