"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-9xl font-bold gradient-text mb-4"
        >
          404
        </motion.h1>
        <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
        <p className="text-foreground/60 mb-8 max-w-md mx-auto">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="primary" className="flex items-center gap-2">
              <Home size={18} />
              Go Home
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
