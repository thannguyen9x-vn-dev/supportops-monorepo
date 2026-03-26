"use client";

import { useState } from "react";
import Image from "next/image";
import CircularProgress from "@mui/material/CircularProgress";
import styles from "./auth.module.css";

export function AuthMain({ children }: { children: React.ReactNode }) {
  const [bgLoaded, setBgLoaded] = useState(false);

  return (
    <main className={styles.main}>
      <Image
        src="/images/auth/auth-background.jpg"
        alt=""
        fill
        priority
        className={styles.mainBg}
        sizes="100vw"
        onLoad={() => setBgLoaded(true)}
      />
      {!bgLoaded && (
        <div className={styles.mainLoading}>
          <CircularProgress size={36} thickness={3} />
        </div>
      )}
      <div className={bgLoaded ? styles.mainContent : styles.mainContentHidden}>
        {children}
      </div>
    </main>
  );
}
