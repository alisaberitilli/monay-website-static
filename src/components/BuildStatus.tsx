interface BuildStatusProps {
  isDarkMode?: boolean;
  compact?: boolean;
}

export default function BuildStatus({ isDarkMode = false, compact = false }: BuildStatusProps) {
  const buildData = [
    { name: 'Monay ID', progress: 78, color: 'bg-green-600' },
    { name: 'CaaS', progress: 48, color: 'bg-blue-600' },
    { name: 'WaaS', progress: 66, color: 'bg-purple-600' },
  ];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-4 px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          Platform Build Status:
        </span>
        {buildData.map((item) => (
          <span key={item.name} className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {item.name} ~{item.progress}%
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Platform Build Status (as of Sept 2, 2025)
        </h3>
      </div>
      
      <div className="space-y-3">
        {buildData.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {item.name}
              </span>
              <span className={`text-sm font-bold ${item.progress >= 70 ? 'text-green-600' : item.progress >= 50 ? 'text-blue-600' : 'text-yellow-600'}`}>
                ~{item.progress}%
              </span>
            </div>
            <div className={`w-full rounded-full h-2 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
              <div className={`h-2 rounded-full ${item.color} transition-all duration-500`} style={{ width: `${item.progress}%` }}></div>
            </div>
          </div>
        ))}
      </div>
      
      <p className={`text-xs mt-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} italic`}>
        Audits, certifications/registrations, partner integrations, and regression testing are pending.
      </p>
    </div>
  );
}