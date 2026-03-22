'use client';

import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LoginRoundedIcon from '@mui/icons-material/LoginRounded';
import { Button } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import styles from './not-found.module.css';

export default function LocaleNotFoundPage() {
  const { locale } = useParams<{ locale: string }>();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <Image
            className={styles.brandLogo}
            src="/icons/brand-mark.png"
            alt="ServiceOps logo"
            width={36}
            height={36}
            priority
          />
          <span>ServiceOps</span>
        </div>

        <nav className={styles.nav}>
          <Link className="active" href={`/${locale}/dashboard`}>
            Dashboard
          </Link>
          <Link href={`/${locale}/admin/user`}>Users</Link>
          <Link href={`/${locale}/requests/list`}>Requests</Link>
          <Link href={`/${locale}/account/profile`}>Settings</Link>
        </nav>

        <Link className={styles.ctaLink} href={`/${locale}/login`}>
          <LoginRoundedIcon fontSize="small" />
          <span>Login/Register</span>
        </Link>
      </header>

      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.imageWrap}>
            <Image
              src="/images/auth/page-not-found.png"
              alt="Page not found illustration"
              fill
              priority
              sizes="(max-width: 900px) 90vw, 620px"
            />
          </div>

          <h1 className={styles.title}>Page not found</h1>
          <p className={styles.subtitle}>
            Oops! Looks like you followed a bad link. If you think this is a problem with us, please tell us.
          </p>

          <Button
            variant="contained"
            startIcon={<ArrowBackRoundedIcon />}
            component={Link}
            href={`/${locale}/dashboard`}
            sx={{
              mt: { xs: 2, md: 2 },
              borderRadius: 2,
              textTransform: 'none',
              px: 3,
              py: 1,
              fontWeight: 600,
            }}
          >
            Go back home
          </Button>
        </section>
      </main>
    </div>
  );
}
