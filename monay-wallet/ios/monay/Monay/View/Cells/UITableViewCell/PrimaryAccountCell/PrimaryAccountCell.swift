//
//  PrimaryAccountCell.swift
//  Monay
//
//  Created by Aayushi Bhagat on 09/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class PrimaryAccountCell: UITableViewCell {
  
  static let identifier = "PrimaryAccountCell"
  
  // MARK: - IBOutlet properties
  
  @IBOutlet weak var usernameLabel: UILabel!
  @IBOutlet weak var phoneNumberLabel: UILabel!
  @IBOutlet weak var balanceLabel: UILabel!
  @IBOutlet weak var checkUncheckImageView: UIImageView!
    
  // MARK: - Helper methods
  
  func configure(_ user: SecondaryUser) {
      usernameLabel.text = "\(user.user?.firstName ?? "") \(user.user?.lastName ?? "")"
      let number = user.user?.phoneNumber ?? ""
      self.phoneNumberLabel.text =  number.customFormatted
      let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
      balanceLabel.text = "\(currencySymbol) \(user.remainAmount == nil ? "0" : user.remainAmount?.description ?? "")"
    }
}
