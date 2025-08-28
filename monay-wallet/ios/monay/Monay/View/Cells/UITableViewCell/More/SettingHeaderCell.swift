//
//  SettingHeaderCell.swift
//  Monay
//
//  Created by Aayushi on 30/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SettingHeaderCell: UITableViewCell {
  
  static let reuseIdentifier = "SettingHeaderCell"
  
  // MARK: - IBOutlet
  
  @IBOutlet weak var lblTitle: UILabel!
  
  override func awakeFromNib() {
    super.awakeFromNib()
    // Initialization code
  }
  
  override func setSelected(_ selected: Bool, animated: Bool) {
    super.setSelected(selected, animated: animated)
    
    // Configure the view for the selected state
  }
  
  func configure(_ title: String) {
    lblTitle.text = title
  }
  
  func configure(_ setting: Setting) {
    lblTitle.text = setting.title
  }
}
