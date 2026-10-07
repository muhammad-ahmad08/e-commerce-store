"use client";

import { Suspense } from "react";
import AuthForm from "@/components/shop/AuthForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex-1" />}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
