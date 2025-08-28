export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Monay Wallet Backend API
        </h1>
        <div className="text-center">
          <p className="mb-4">API Version: 2.0.0</p>
          <p className="mb-4">Built with Next.js 15</p>
          <div className="mt-8">
            <a
              href="/api-docs"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View API Documentation
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}