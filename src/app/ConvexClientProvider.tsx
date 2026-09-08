"use client";

import React, { useState, ReactNode } from "react";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "https://valiant-porcupine-369.convex.cloud";

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  // Create client lazily inside useState so it's only instantiated on the client,
  // never during SSR — this prevents the hydration mismatch error.
  const [convex] = useState(() => new ConvexReactClient(convexUrl));
  return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
