'use client';

import { Button } from '@/components';

export default function NotFound() {
  return (
    <div className="h-[calc(100vh-200px)] flex flex-col items-center justify-center text-center px-4">
      <div className="mb-8">
        <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-500 mb-4">
          404
        </h1>
        <h2 className="text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-xl text-slate-400 mb-8 max-w-md mx-auto">
          Looks like this page wandered off into the digital void. Let's get you back on track.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button type="primary" size="large" to="/">
          Back Home
        </Button>
        <Button type="ghost" size="medium" to="/blog">
          View Blog
        </Button>
        <Button type="secondary" size="small" to="/blog">
          View Blog
        </Button>
      </div>

      <div className="mt-16 text-slate-500 text-sm">
        <p>✨ Error Code: 404 - The page you're looking for doesn't exist</p>
      </div>
    </div>
  );
}
