"use client";

import { useEffect, useState } from "react";
import { checkAuth, waitForExtension } from "@/lib/chrome";
import NotebookList from "@/components/NotebookList";
import InstallExtension from "@/components/InstallExtension";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [extensionAvailable, setExtensionAvailable] = useState(false);

  useEffect(() => {
    async function init() {
      console.log('[NotebookLM Web] Initializing...');

      // Wait for extension to be ready (with timeout)
      const available = await waitForExtension();
      console.log('[NotebookLM Web] Extension available:', available);
      setExtensionAvailable(available);

      if (available) {
        console.log('[NotebookLM Web] Checking auth...');
        const authenticated = await checkAuth();
        console.log('[NotebookLM Web] Authenticated:', authenticated);
        setIsAuthenticated(authenticated);
      }

      setIsLoading(false);
    }

    init();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!extensionAvailable) {
    return <InstallExtension />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-4">未登录 NotebookLM</h1>
          <p className="text-gray-600 mb-6">
            请先在 NotebookLM 网站登录，然后刷新此页面
          </p>
          <button
            onClick={() => {
              window.open("https://notebooklm.google.com", "_blank");
            }}
            className="btn btn-primary mr-2"
          >
            打开 NotebookLM
          </button>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-secondary"
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notebook and Batch
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                NotebookLM 批量操作工具
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                已认证
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <NotebookList />
      </main>

      <footer className="mt-auto py-6 text-center text-sm text-gray-500">
        <p>
          Notebook and Batch - 网页版 NotebookLM CLI
        </p>
        <p className="mt-1">
          基于{" "}
          <a
            href="https://github.com/jacob-bd/notebooklm-mcp-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            notebooklm-mcp-cli
          </a>{" "}
          构建
        </p>
      </footer>
    </div>
  );
}
