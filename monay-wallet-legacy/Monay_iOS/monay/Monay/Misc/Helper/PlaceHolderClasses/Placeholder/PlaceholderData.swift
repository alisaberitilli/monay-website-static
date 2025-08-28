
import UIKit

public enum PlaceholderActionType {
  case tryAgain
  case login
  case searchAgain
  case setting
  
  var displayTitle: String {
    switch self {
    case .login:
      return LocalizedKey.login.value
      
    case .searchAgain:
      return LocalizedKey.searchAgain.value
      
    case .tryAgain:
      return LocalizedKey.tryAgian.value
      
    case .setting:
      return LocalizedKey.goToSetting.value
    }
  }
}

/// Contains the placeholder data: texts, image, etc 
public struct PlaceholderData {
  
  // MARK: properties
  
  /// The placeholder image, if the image is nil, the placeholder image view will be hidden
  public var image: UIImage?
  
  /// the placeholder title
  public var title: String?
  
  /// The placeholder subtitle
  public var subtitle: String?
  
  /// The placehlder action title, if the action title is nil, the placeholder action button will be hidden
  public var action: PlaceholderActionType?
  
  /// Should shows the activity indicator of the placeholder or not
  public var showsLoading = false
  
  // MARK: init methods
  public init() {}
  
  public mutating func setSubTitle(_ title: String?){
    subtitle = title
  }
  
  public mutating func setTitle(_ title: String?){
    self.title = title
  }
  
  public static var loading: PlaceholderData {
    var loadingStyle = PlaceholderData()
    loadingStyle.showsLoading = true
    return loadingStyle
  }
  
  public static var apiResponseError: PlaceholderData {
    var apiResponseErrorStyle      = PlaceholderData()
    apiResponseErrorStyle.image    = PlaceholdersProvider.image(named: LocalizedKey.noDataImage.value)
    apiResponseErrorStyle.title    = ""
    apiResponseErrorStyle.subtitle = ""
    apiResponseErrorStyle.action   = .tryAgain
    
    return apiResponseErrorStyle
  }
  
  public static var noResults: PlaceholderData {
    var noResultsStyle      = PlaceholderData()
    noResultsStyle.image    = PlaceholdersProvider.image(named: LocalizedKey.noDataImage.value)
    noResultsStyle.title    = LocalizedKey.messageNoDataAvailable.value
    noResultsStyle.subtitle = LocalizedKey.canNotFind.value
    noResultsStyle.action   = nil
    return noResultsStyle
  }
  
  /// The default data (texts, image, ...) of the default no search results placeholder
  public static var noSearchResults: PlaceholderData {
    var noSearchResults      = PlaceholderData()
    noSearchResults.image    = PlaceholdersProvider.image(named: LocalizedKey.notResultFoundImage.value)
    noSearchResults.title    = LocalizedKey.messageNotResultFound.value
    noSearchResults.subtitle = LocalizedKey.messageNoRelevantDataAvailable.value
    noSearchResults.action   = .searchAgain
    return noSearchResults
  }
  
  /// The default data (texts, image, ...) of the default no connecton placeholder
  public static var noConnection: PlaceholderData {
    var noConnectionStyle      = PlaceholderData()
    noConnectionStyle.image    = PlaceholdersProvider.image(named: LocalizedKey.noInternetImage.value)
    noConnectionStyle.title    = LocalizedKey.messageNoInternetConnection.value
    noConnectionStyle.subtitle = LocalizedKey.checkInternetConnetion.value
    noConnectionStyle.action   = .tryAgain
    return noConnectionStyle
  }
    
    public static var custom: PlaceholderData {
        var custom = PlaceholderData()
        custom.image    = nil
        custom.title    = nil
        custom.subtitle = nil
        custom.action   = nil
        return custom
    }
}
