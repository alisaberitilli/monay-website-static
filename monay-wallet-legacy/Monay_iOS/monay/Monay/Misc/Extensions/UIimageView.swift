//
//  UIimageView.swift
//  Monay
//
//  Created by WFH on 12/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import Kingfisher

extension UIImageView {
  
  func setImage(with url: URL) {
    self.kf.indicatorType = .activity
    self.kf.setImage(with: url)
  }
  
  func setImage(with url: URL, size: CGSize) {
    
    let processor = ResizingImageProcessor(referenceSize: size, mode: .aspectFill)
    
    self.kf.indicatorType = .activity
    self.kf.setImage(with: url, options: [.processor(processor)])
  }
  
  func cancelDownload() {
    self.kf.cancelDownloadTask()
  }
  
  func setImageWithPlaceholder(with url: URL?, placeholderImage: UIImage) {
    self.kf.setImage(with: url, placeholder: placeholderImage)
  }
}
