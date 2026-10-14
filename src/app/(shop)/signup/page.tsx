"use client";

import { Suspense } from "react";
import AuthForm from "@/components/shop/AuthForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<main id="main-content" tabIndex={-1} className="flex-1" />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
