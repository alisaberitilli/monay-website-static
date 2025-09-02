interface FeatureAvailabilityProps {
  isDarkMode?: boolean;
}

type FeatureStatus = 'available' | 'preview' | 'development';

interface Feature {
  capability: string;
  id: FeatureStatus;
  caas: FeatureStatus;
  waas: FeatureStatus;
}

export default function FeatureAvailability({ isDarkMode = false }: FeatureAvailabilityProps) {
  const features: Feature[] = [
    { capability: 'WebAuthn/Passkeys', id: 'available', caas: 'development', waas: 'development' },
    { capability: 'Multi-factor Authentication', id: 'available', caas: 'development', waas: 'preview' },
    { capability: 'Custodian Recovery', id: 'preview', caas: 'development', waas: 'development' },
    { capability: 'SSO/SAML/OIDC', id: 'preview', caas: 'development', waas: 'development' },
    { capability: 'Branded Stablecoin Issuance', id: 'development', caas: 'preview', waas: 'development' },
    { capability: 'Treasury Management', id: 'development', caas: 'preview', waas: 'development' },
    { capability: 'Cross-Rail Swaps', id: 'development', caas: 'development', waas: 'development' },
    { capability: 'Policy Engine', id: 'development', caas: 'preview', waas: 'available' },
    { capability: 'Refunds/Returns', id: 'development', caas: 'development', waas: 'preview' },
    { capability: 'Multi-Role Wallets', id: 'development', caas: 'development', waas: 'preview' },
    { capability: 'Card Issuing', id: 'development', caas: 'development', waas: 'development' },
    { capability: 'Cardless ATM Access', id: 'development', caas: 'development', waas: 'development' },
    { capability: 'Invoice First™', id: 'development', caas: 'preview', waas: 'preview' },
  ];

  const getStatusIcon = (status: FeatureStatus) => {
    switch (status) {
      case 'available':
        return <span className="text-green-600" title="Available">✅</span>;
      case 'preview':
        return <span className="text-yellow-600" title="Private Preview">🟡</span>;
      case 'development':
        return <span className="text-gray-400" title="In Development">⏳</span>;
    }
  };

  const getStatusText = (status: FeatureStatus) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'preview':
        return 'Private Preview';
      case 'development':
        return 'In Development';
    }
  };

  return (
    <div className={`overflow-x-auto rounded-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <table className="w-full">
        <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
          <tr>
            <th className={`px-6 py-4 text-left text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Capability
            </th>
            <th className={`px-6 py-4 text-center text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              Monay ID
            </th>
            <th className={`px-6 py-4 text-center text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              CaaS
            </th>
            <th className={`px-6 py-4 text-center text-sm font-bold ${isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              WaaS
            </th>
          </tr>
        </thead>
        <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
          {features.map((feature, index) => (
            <tr key={index} className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
              <td className={`px-6 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                {feature.capability}
              </td>
              <td className="px-6 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  {getStatusIcon(feature.id)}
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getStatusText(feature.id)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  {getStatusIcon(feature.caas)}
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getStatusText(feature.caas)}
                  </span>
                </div>
              </td>
              <td className="px-6 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  {getStatusIcon(feature.waas)}
                  <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {getStatusText(feature.waas)}
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={`px-6 py-4 border-t ${isDarkMode ? 'border-gray-700 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex gap-6 text-xs">
          <span className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Available</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-yellow-600">🟡</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Private Preview</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-gray-400">⏳</span>
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>In Development</span>
          </span>
        </div>
        <p className={`text-xs mt-2 italic ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
          Feature availability varies by program, tier, and region.
        </p>
      </div>
    </div>
  );
}