
import Foundation
import UIKit

extension PlaceholdersProvider {
  
  public static var defaultProvider: PlaceholdersProvider {
    
    var commonStyle = PlaceholderStyle()
    commonStyle.backgroundColor = .clear
    commonStyle.actionBackgroundColor = Color.yellow
    commonStyle.actionTitleColor = .black
    commonStyle.isAnimated = false
    commonStyle.subtitleColor = .black
    commonStyle.titleColor = #colorLiteral(red: 0.7019607843, green: 0.7215686275, blue: 0.7647058824, alpha: 1)
    commonStyle.titleFont = UIFont.customFont(style: .bold, size: .custom(16))
    commonStyle.subtitleFont = UIFont.customFont(style: .medium, size: .custom(14))
    
    let error = Placeholder(data: .apiResponseError, style: commonStyle, key: .errorKey)
    let loading = Placeholder(data: .loading, style: commonStyle, key: .loadingKey)
    let noSearchResults = Placeholder(data: .noSearchResults, style: commonStyle, key: .noSearchResult)
    let noResults = Placeholder(data: .noResults, style: commonStyle, key: .noResultsKey)
    let noConnection = Placeholder(data: .noConnection, style: commonStyle, key: .noConnectionKey)
    let custom = Placeholder(data: .custom, style: commonStyle, key: .custom)
    
    let placeholdersProvider = PlaceholdersProvider(loading: loading,
                                                    noSearchResults: noSearchResults,
                                                    noResults: noResults,
                                                    noConnection: noConnection,
                                                    error: error,
                                                    custom: custom)
    return placeholdersProvider
  }
}

// MARK: images Utilities
extension PlaceholdersProvider {
  static func image(named name: String) -> UIImage? {
    let image = UIImage(named: name) ?? UIImage(named: name, in: Bundle(for: self), compatibleWith: nil)
    return image
  }
}
