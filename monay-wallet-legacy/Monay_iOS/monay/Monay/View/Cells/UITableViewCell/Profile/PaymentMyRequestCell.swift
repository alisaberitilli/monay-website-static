//
//  PaymentMyRequestCell.swift
//  Monay
//
//  Created by WFH on 24/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentMyRequestCell: UITableViewCell {
    
    static let identifier = "PaymentMyRequestCell"
  
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var titleLabel: UILabel!
    
    // MARK: - Helper methods
    
    func configure(myRequest: PaymentRequest) {
        selectionStyle = .none
        
        let profileString = myRequest.toUser?.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        nameLabel.text = "\(myRequest.toUser?.firstName ?? "") \(myRequest.toUser?.lastName ?? "")"
        
        statusLabel.text = myRequest.status?.capitalized
        
        setPaymentStatusColor(for: myRequest.status)

      let createdAt = myRequest.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        dateLabel.text = createdAt
        
        if let amount = myRequest.amount {
            let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            amountLabel.text = "\(currencySymbol) \(amount)"
        }
        
        titleLabel.text = myRequest.message
    }
    
    private func setPaymentStatusColor(for status: String?) {
      if status == LocalizedKey.pending.value {
            self.statusLabel.textColor = .orange
      } else if status == LocalizedKey.paid.value.lowercased() {
            self.statusLabel.textColor = #colorLiteral(red: 0.1647058824, green: 0.6078431373, blue: 0.3607843137, alpha: 1)
      } else if status == LocalizedKey.declined.value {
            self.statusLabel.textColor = #colorLiteral(red: 0.968627451, green: 0.1294117647, blue: 0.1333333333, alpha: 1)
        } else {
            self.statusLabel.textColor = UIColor.black
        }
    }
}
