'use client';

import { useState, useEffect } from 'react';
import { Button } from '@template/ui';

export default function Home() {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`)
      .then(res => res.json())
      .then(data => {
        setHealth(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch health:', err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Welcome to Template App
        </h1>

        <div className="mb-8 text-center">
          <p className="text-xl mb-4">
            A modern full-stack application template with Next.js and Fastify
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Frontend</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Next.js 14 with App Router</li>
              <li>TypeScript</li>
              <li>Tailwind CSS</li>
              <li>React 18</li>
            </ul>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Backend</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Fastify</li>
              <li>Prisma ORM</li>
              <li>PostgreSQL</li>
              <li>JWT Authentication</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">API Health Status</h3>
          {loading ? (
            <p>Loading...</p>
          ) : health ? (
            <div className="bg-green-100 dark:bg-green-900 p-4 rounded-lg">
              <p>Status: {health.status}</p>
              <p>Version: {health.version}</p>
              <p>Timestamp: {new Date(health.timestamp).toLocaleString()}</p>
            </div>
          ) : (
            <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
              <p>Failed to connect to API</p>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-4 justify-center">
          <Button variant="default" size="lg">
            Get Started
          </Button>
          <Button variant="secondary" size="lg">
            Documentation
          </Button>
        </div>
      </div>
    </main>
  );
}
