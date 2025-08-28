
import UIKit

protocol CellPlaceholding {
  
  var titleLabel: UILabel? { get set }
  var subtitleLabel: UILabel? { get set }
  var placeholderImageView: UIImageView? { get set }
  var actionButton: UIButton? { get set }
  var activityIndicatorLoader : PlaceHolderLoader? { get set }
  
  var cellView: UIView { get }
  
  func apply(style: PlaceholderStyle, tintColor: UIColor?)
  func apply(data: PlaceholderData)
}

extension CellPlaceholding {
  
  internal func apply(style: PlaceholderStyle, tintColor: UIColor?) {
    cellView.backgroundColor = style.backgroundColor ?? .clear
    
    let actionColor = style.actionTitleColor ?? .black
    actionButton?.setTitleColor(actionColor, for: .normal)
    
    titleLabel?.textColor = style.titleColor ?? .red
    subtitleLabel?.textColor = style.subtitleColor ?? .green
    
    titleLabel?.font = style.titleFont ?? UIFont.customFont(style: .bold, size: .custom(23))
    subtitleLabel?.font = style.subtitleFont ?? UIFont.customFont(style: .bold, size: .custom(20))
  }
  
  internal func apply(data: PlaceholderData) {
    
    actionButton?.setTitle(data.action?.displayTitle, for: .normal)
    actionButton?.isHidden = (data.action == nil)
    actionButton?.titleLabel?.font = UIFont.customFont(style: .bold, size: .custom(18))
    
    titleLabel?.text = data.title
    titleLabel?.isHidden = (data.title == nil)
    
    subtitleLabel?.text = data.subtitle
    subtitleLabel?.isHidden = (data.title == nil)
    
    placeholderImageView?.image = data.image
    placeholderImageView?.isHidden = (data.image == nil)
    
    activityIndicatorLoader?.stopAnimating()
    activityIndicatorLoader?.isHidden = !(data.showsLoading)
    if  data.showsLoading {
      activityIndicatorLoader?.startAnimating()
    }
  }
}
