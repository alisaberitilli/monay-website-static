//
//  StatefulView.swift
//  CamioCustomer
//
//  Created by Sadanand on 01/02/18.
//  Copyright © 2018 Codiant Software Technologies Pvt Ltd. All rights reserved.
//

import UIKit

class StatefulView: UIView {
  
  public weak var placeholderDelegate: PlaceholderDelegate?
  public var currentApiRequestPath: String?
  public private(set) var currentState: PlaceholderKey = .stateDefault
  public var placeholderViewInsets: UIEdgeInsets?
  
  private lazy var defaultPlaceholdeData: [PlaceholderKey: Placeholder] = {
    var commonStyle = PlaceholderStyle()
    commonStyle.backgroundColor = .clear
    commonStyle.actionBackgroundColor = Color.yellow
    commonStyle.actionTitleColor = .white
    commonStyle.isAnimated = false
    commonStyle.subtitleColor = .white
    commonStyle.titleColor = .white
    commonStyle.titleFont = UIFont.customFont(style: .bold, size: .custom(22))
    commonStyle.subtitleFont = UIFont.customFont(style: .bold, size: .custom(18))
    commonStyle.actionTitleFont = UIFont.customFont(style: .bold, size: .custom(14))
        
    let error = Placeholder(data: .apiResponseError, style: commonStyle, key: .errorKey)
    let loading = Placeholder(data: .loading, style: commonStyle, key: .loadingKey)
    let noSearchResults = Placeholder(data: .noSearchResults, style: commonStyle, key: .noSearchResult)
    let noResults = Placeholder(data: .noResults, style: commonStyle, key: .noResultsKey)
    let noConnection = Placeholder(data: .noConnection, style: commonStyle, key: .noConnectionKey)
    
    let dicTypes = [PlaceholderKey.errorKey: error,
                    PlaceholderKey.loadingKey: loading,
                    PlaceholderKey.noSearchResult: noSearchResults,
                    PlaceholderKey.noResultsKey: noResults,
                    PlaceholderKey.noConnectionKey: noConnection]
    
    return dicTypes
  }()
  
  var placeholderView: PlaceHolderView?
  
  override init(frame: CGRect) {
    super.init(frame: frame)
    //DDLogDebug("initWithFrame")
  }
  
  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    //DDLogDebug("initWithaDecoder")
  }
}

//MARK: - Switch methods
extension StatefulView {
  
  func showDefault() {
    currentState = .stateDefault
    removePlaceholder()
    self.subviews.forEach { $0.isHidden = false }
  }
  
  func showError(message: String, actionType: PlaceholderActionType = .tryAgain) {
    guard var dataSource = dataSource(for: .errorKey) else {
      return
    }
    
    dataSource.data?.subtitle = message
    dataSource.data?.action = actionType
    
    showPlaceholder(with: dataSource)
  }
  
  func showLoading() {
    guard let dataSource = dataSource(for: .loadingKey) else {
      return
    }
    
    showPlaceholder(with: dataSource)
  }
  
  func showNoResults(title: String? = LocalizedKey.messageNoDataAvailable.value, message: String? = LocalizedKey.canNotFind.value, image: String = LocalizedKey.noDataImage.value) {
    guard var dataSource = dataSource(for: .noResultsKey) else {
      return
    }
    dataSource.data?.image = PlaceholdersProvider.image(named: image)
    dataSource.data?.title = title
    dataSource.data?.subtitle = message
    
    showPlaceholder(with: dataSource)
  }
  
  func showNoSearchResult() {
    guard let dataSource = dataSource(for: .noSearchResult) else {
      return
    }
    showPlaceholder(with: dataSource)
  }
  
  func showNoConnection() {
    guard let dataSource = dataSource(for: .noConnectionKey) else {
      return
    }
    showPlaceholder(with: dataSource)
  }
}

extension StatefulView {
  
  /// Allows you to add new placeholders
  private func showPlaceholder(with dataSource: Placeholder) {
    
    currentState = dataSource.key
    
    if let _ = self.placeholderView { //if placeholder view is already added on view than change only data and style
      setupDataStyleOnView(style: dataSource.style!, data: dataSource.data!)
      
    } else { //Add placeholder
      placeholderView = PlaceHolderView.instantiateView()
      setupDataStyleOnView(style: dataSource.style!, data: dataSource.data!)
      
      placeholderView!.translatesAutoresizingMaskIntoConstraints = false
      addSubview(placeholderView!)
      addConstrnt()
    }
    
    animate()
    
    placeholderView?.onActionButtonTap = { [weak self] in
      guard let strngSelf = self else { return }
      strngSelf.placeholderDelegate?.placeHolderActionOn(strngSelf, placeholder: dataSource, requestedApiPath: strngSelf.currentApiRequestPath)
    }
  }
  
  func addConstrnt() {
    guard let view = placeholderView else {
      return
    }
    
    let insets = placeholderDelegate?.placeholderViewInsets() ?? UIEdgeInsets()
    
    let metrics = ["top": insets.top,
                   "bottom": insets.bottom,
                   "left": insets.left,
                   "right": insets.right]
    
    let views = ["view": view]
    
    let hConstraints = NSLayoutConstraint.constraints(withVisualFormat: "|-left-[view]-right-|",
                                                      options: [],
                                                      metrics: metrics,
                                                      views: views)
    
    let vConstraints = NSLayoutConstraint.constraints(withVisualFormat: "V:|-top-[view]-bottom-|",
                                                      options: [],
                                                      metrics: metrics,
                                                      views: views)
    addConstraints(hConstraints)
    addConstraints(vConstraints)
  }
  
  func animate() {
    animateImage()
    animateButton()
  }
  
  func animateButton() {
    guard let button = placeholderView?.actionButton else { return }
    
    let stretch = CGAffineTransform(scaleX: 0.5, y: 0.5)
    button.transform = stretch
    button.alpha = 0.5
    
    UIView.animate(withDuration: 1.5,
                   delay: 0.0,
                   usingSpringWithDamping:  0.35,
                   initialSpringVelocity: 4.0,
                   options:[.curveEaseOut],
                   animations: {
                    
                    button.alpha = 1.0
                    let stretch = CGAffineTransform(scaleX: 1.0, y: 1.0)
                    button.transform = stretch
                    
    }, completion: nil)
  }
  
  func animateImage() {
    guard let imageView = placeholderView?.placeholderImageView else {
      return
    }
    
    let rotate = CGAffineTransform(rotationAngle: -0.2)
    let stretchAndRotate = rotate.scaledBy(x: 0.5, y: 0.5)
    imageView.transform = stretchAndRotate
    imageView.alpha = 0.5
    
    UIView.animate(withDuration: 1.5,
                   delay: 0.0,
                   usingSpringWithDamping:  0.35,
                   initialSpringVelocity: 4.0,
                   options:[.curveEaseOut],
                   animations: {
                    imageView.alpha = 1.0
                    let rotate = CGAffineTransform(rotationAngle: 0.0)
                    let stretchAndRotate = rotate.scaledBy(x: 1.0, y: 1.0)
                    imageView.transform = stretchAndRotate
                    
    }, completion: nil)
  }
  
  private func removePlaceholder() {
    placeholderView?.removeFromSuperview()
    placeholderView = nil
  }
  
  private func setupDataStyleOnView(style: PlaceholderStyle, data: PlaceholderData) {
    apply(data)
    apply(style)
  }
  
  private func apply(_ style: PlaceholderStyle) {
    
    if let phView = self.placeholderView {
      phView.backgroundColor = style.backgroundColor ?? .clear
      
      let buttonBackgroundColor = style.actionBackgroundColor ?? .blue
      phView.actionButton?.backgroundColor = buttonBackgroundColor
      
      let actionColor = style.actionTitleColor ?? .white
      phView.actionButton?.setTitleColor(actionColor, for: .normal)
      
      phView.actionButton?.titleLabel?.font = style.actionTitleFont
      
      phView.titleLabel?.textColor = style.titleColor ?? .red
      phView.subtitleLabel?.textColor = style.subtitleColor ?? .green
      
      phView.titleLabel?.font = style.titleFont ?? UIFont.customFont(style: .bold, size: .custom(23))
      phView.subtitleLabel?.font = style.subtitleFont ?? UIFont.customFont(style: .bold, size: .custom(20))
    }
  }
  
  private func apply(_ data: PlaceholderData) {
    
    if let phView = self.placeholderView {
      phView.actionButton?.setTitle(data.action?.displayTitle, for: .normal)
      phView.actionButton?.isHidden = (data.action == nil)
      phView.actionButton?.titleLabel?.font = UIFont.customFont(style: .bold, size: .custom(15))
      
      phView.titleLabel?.text = data.title
      phView.titleLabel?.isHidden = (data.title == nil)
      
      phView.subtitleLabel?.text = data.subtitle
      phView.subtitleLabel?.isHidden = (data.title == nil)
      
      phView.placeholderImageView?.image = data.image
      phView.placeholderImageView?.isHidden = (data.image == nil)
      
      phView.activityIndicatorLoader?.stopAnimating()
      phView.activityIndicatorLoader?.isHidden = !(data.showsLoading)
      if data.showsLoading {
        phView.activityIndicatorLoader?.startAnimating()
      }
    }
  }
  
  private func dataSource(for key: PlaceholderKey) -> Placeholder? {
    if let dataSource = defaultPlaceholdeData[key] {
      return dataSource
    } else {
      return nil
    }
  }
}
