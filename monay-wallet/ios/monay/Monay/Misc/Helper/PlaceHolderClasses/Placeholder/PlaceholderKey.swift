
import Foundation

public enum PlaceholderState {
  
  case loading
  case error(message: String, actionType: PlaceholderActionType)
  case noConnection
  case defaultState
  case noResult(message: String?)
  case noSearchResult
  
  var rawValue: Int {
    switch self {
    case .loading:
      return 0
    case .error:
      return 1
    case .noConnection:
      return 2
    case .defaultState:
      return 3
    case .noResult(_):
      return 4
    case .noSearchResult:
      return 5
    }
  }
}

/// Manage all keys of placeholsers, each placeholder should has an unique key
/// Struct instead of enum because here we need to extend the number of cases.
public struct PlaceholderKey: Hashable {
  
  // MARK: properties
  
  /// The key value
  public let value: String
  
  // MARK: init methods
  
  
  /// Create and return a PlaceholderKey with the specified key value
  ///
  /// - Parameter value: the value of the key
  private init(value: String) {
    self.value = value
  }
  
  // MARK: default keys
  public static var loadingKey      = PlaceholderKey(value: "loading")
  public static var noConnectionKey = PlaceholderKey(value: "noConnection")
  public static var noSearchResult  = PlaceholderKey(value: "noSearchResults")
  public static var noResultsKey    = PlaceholderKey(value: "noResults")
  public static var errorKey        = PlaceholderKey(value: "error")
  public static var stateDefault    = PlaceholderKey(value: "stateDefault")
  public static var custom          = PlaceholderKey(value: "custom")
  
  public var hashValue: Int {
    return value.hashValue
  }
  
  public func hash(into hasher: inout Hasher) {
    hasher.combine(value)
  }
}

extension PlaceholderKey: Equatable {
  
  // To make PlaceholderKey hashable
  public static func == (lhs: PlaceholderKey, rhs: PlaceholderKey) -> Bool {
    return lhs.value == rhs.value
  }
}
