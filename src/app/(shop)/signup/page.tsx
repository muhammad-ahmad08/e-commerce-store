"use client";

import { Suspense } from "react";
import AuthForm from "@/components/shop/AuthForm";

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
