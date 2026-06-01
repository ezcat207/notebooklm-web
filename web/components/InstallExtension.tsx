export default function InstallExtension() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="card max-w-2xl">
        <div className="text-6xl text-center mb-6">🔌</div>
        <h1 className="text-3xl font-bold text-center mb-4">
          未检测到 Chrome 插件
        </h1>

        <div className="space-y-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="font-semibold text-blue-900 mb-2">
              请按以下步骤安装插件：
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-blue-800">
              <li>下载或定位到 chrome-extension 文件夹</li>
              <li>打开 Chrome 浏览器，访问 chrome://extensions/</li>
              <li>开启右上角的"开发者模式"</li>
              <li>点击"加载已解压的扩展程序"</li>
              <li>选择 chrome-extension 文件夹</li>
              <li>确认安装并授予权限</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h2 className="font-semibold text-yellow-900 mb-2">
              然后登录 NotebookLM：
            </h2>
            <ol className="list-decimal list-inside space-y-2 text-yellow-800">
              <li>访问 notebooklm.google.com</li>
              <li>使用 Google 账号登录</li>
              <li>刷新此页面</li>
            </ol>
          </div>
        </div>

        <div className="bg-gray-100 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">
            插件权限说明：
          </h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• 读取 notebooklm.google.com 的 Cookie (仅用于认证)</li>
            <li>• 调用 NotebookLM API (批量操作)</li>
            <li>• 下载文件到本地 (不会上传任何数据)</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            我已安装插件，刷新页面
          </button>
        </div>
      </div>
    </div>
  );
}
