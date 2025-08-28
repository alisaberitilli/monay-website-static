//
//  TableViewCell.swift
//  PlaceHolderDemo
//
//  Created by Ashish Shah on 23/08/17.
//  Copyright © 2017 Codiant. All rights reserved.
//

import UIKit

class TableViewCell: UITableViewCell {
  
  var onActionButtonTap: (() -> Void)?
  
  // MARK: Properties
  
  @IBOutlet weak var titleLabel: UILabel?
  @IBOutlet weak var subtitleLabel: UILabel?
  @IBOutlet weak var placeholderImageView: UIImageView?
  @IBOutlet weak var actionButton: UIButton?
  @IBOutlet weak var activityIndicatorLoader: PlaceHolderLoader?
  
  var cellView: UIView {
    return self
  }
  
  @IBAction func btnRetry_Action(_ sender: Any) {
    onActionButtonTap?()
  }
}

extension TableViewCell: NibLoadable {}
extension TableViewCell: Reusable {}
extension TableViewCell: CellPlaceholding {}

