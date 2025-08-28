//
//  AccountTransactionCell.swift
//  Monay
//
//  Created by Codiant on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class AccountTransactionCell: UITableViewCell {
  
  @IBOutlet weak var transferStatusLabel: UILabel!
  @IBOutlet weak var transferAmountLabel: UILabel!
  @IBOutlet weak var transactionIdLabel: UILabel!
  @IBOutlet weak var dateTimeLabel: UILabel!
  @IBOutlet weak var userNameLabel: UILabel!
  @IBOutlet weak var userProfileImageView: UIImageView!

  static var identifier = "AccountTransactionCell"

func configure(transaction: Transaction) {
  
  var user: User?
  let actionType = transaction.actionType
  let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
  
  if actionType == .deposit {
    user = transaction.toUser
    if let amount = transaction.amount {
      transferAmountLabel.text = "+ \(currencySymbol) \(amount)"
    }
    transferStatusLabel.text = LocalizedKey.added.value
    transferStatusLabel.textColor = #colorLiteral(red: 0.1647058824, green: 0.6078431373, blue: 0.3607843137, alpha: 1)
  } else if actionType == .withdrawal {
    user = transaction.fromUser
    if let amount = transaction.amount {
      transferAmountLabel.text = "- \(currencySymbol) \(amount)"
    }
    transferStatusLabel.text = LocalizedKey.withdrawal.value
    transferStatusLabel.textColor = #colorLiteral(red: 0.968627451, green: 0.1294117647, blue: 0.1333333333, alpha: 1)
  } else {
    
    let selfUserId = Authorization.shared.userCredentials.id ?? ""
    
    if selfUserId != transaction.toUser?.id {
      user = transaction.toUser
      
      if let amount = transaction.amount {
        transferAmountLabel.text = "- \(currencySymbol) \(amount)"
      }
      transferStatusLabel.text = LocalizedKey.transfer.value
      transferStatusLabel.textColor = #colorLiteral(red: 0.968627451, green: 0.1294117647, blue: 0.1333333333, alpha: 1)
    } else {
      
      user = transaction.fromUser
      
      if let amount = transaction.amount {
        transferAmountLabel.text = "+ \(currencySymbol) \(amount)"
      }
      
      transferStatusLabel.text = LocalizedKey.added.value
      transferStatusLabel.textColor = #colorLiteral(red: 0.1647058824, green: 0.6078431373, blue: 0.3607843137, alpha: 1)
      
    }
  }
  
  if transaction.status == LocalizedKey.failed.value {
    transferStatusLabel.text = LocalizedKey.failed.value.capitalized
    transferStatusLabel.textColor = #colorLiteral(red: 0.968627451, green: 0.1294117647, blue: 0.1333333333, alpha: 1)
  }
  
  let profileString = user?.profilePictureUrl ?? ""
  if let profileUrl = URL(string: profileString) {
    userProfileImageView.setImage(with: profileUrl)
  }
  
  userNameLabel.text = "\(user?.firstName ?? "") \(user?.lastName ?? "")"
  let createdAt = transaction.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
  dateTimeLabel.text = createdAt
  transactionIdLabel.attributedText = "Trans. ID: ".attributedString("Trans. ID: ", titleColor: .lightGray, subTitle: transaction.transactionId ?? "", subTitleColor: .black, titleFontSize: 14.0, subtitleFontSize: 14.0, titleStyle: .medium, subtitleStyle: .medium, fontFamily: .ceraPro, textAlignment: .left, spacing: 5.0) // swiftlint:disable:this line_length
}
  
}
