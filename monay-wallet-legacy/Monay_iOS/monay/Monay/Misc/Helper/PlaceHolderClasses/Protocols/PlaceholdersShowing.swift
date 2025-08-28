
import UIKit

protocol PlaceholdersShowing {
  
  var provider: PlaceholdersProvider { get }
  
  func showPlaceholder(with : PlaceholderDataSourceDelegate)
  func showDefault()
  
  func showError(message: String, actionType: PlaceholderActionType)
  func showLoading()
  func showNoResults(title: String?, message: String?, image: String)
  func showNoSearchResult()
  func showNoConnection()
  func showCustom(placeholder: Placeholder)
}

extension PlaceholdersShowing {
  
  func showError(message: String, actionType: PlaceholderActionType = .tryAgain) {
    guard let dataSource = provider.errorDataSource() else {
      return
    }
    dataSource.placeholder.data?.setSubTitle(message)
    dataSource.placeholder.data?.action = actionType
    showPlaceholder(with: dataSource)
  }
  
  func showLoading() {
    guard let dataSource = provider.loadingDataSource() else {
      return
    }
    showPlaceholder(with: dataSource)
  }
  
  /// if the title and message is nil, the placeholder title and message will be hidden
  func showNoResults(title: String? = LocalizedKey.messageNoDataAvailable.value, message: String? = LocalizedKey.canNotFind.value, image: String = LocalizedKey.noDataImage.value) {
    guard let dataSource = provider.noResultsDataSource() else {
      return
    }
    dataSource.placeholder.data?.image = PlaceholdersProvider.image(named: image)
    dataSource.placeholder.data?.setSubTitle(message)
    dataSource.placeholder.data?.setTitle(title)
    showPlaceholder(with: dataSource)
  }
  
  func showCustom(placeholder: Placeholder) {
    guard let dataSource = provider.customDataSource() else {
      return
    }
    
    dataSource.placeholder.data = placeholder.data
    dataSource.placeholder.style = placeholder.style
    
    showPlaceholder(with: dataSource)
  }
  
  func showNoSearchResult() {
    guard let dataSource = provider.noSearchResultsDataSource() else {
      return
    }
    showPlaceholder(with: dataSource)
  }
  
  func showNoConnection() {
    guard let dataSource = provider.noConnectionDataSource() else {
      return
    }
    showPlaceholder(with: dataSource)
  }
}

//UIFont.customFont(style: .semibold, size: .custom(23))
