//
//  PaymentReceivedCell.swift
//  Monay
//
//  Created by WFH on 13/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PaymentReceivedCell: UITableViewCell {
    
    static let identifier = "PaymentReceivedCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    @IBOutlet weak var dateLabel: UILabel!
    @IBOutlet weak var amountLabel: UILabel!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var stackView: UIStackView!
    @IBOutlet weak var declineButton: UIButton!
    @IBOutlet weak var payButton: UIButton!
    @IBOutlet weak var constraintStackHeight: NSLayoutConstraint!
    @IBOutlet weak var constraintStackBottom: NSLayoutConstraint!
    
    // MARK: - Instance properties
    
    var callbackPayButton: ((Int) -> Void)?
    var callbackDeclineButton: ((Int) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(paymentRequest: PaymentRequest, isHidePayDecline: Bool) {
        selectionStyle = .none
        constraintStackHeight.constant = isHidePayDecline ? 0 : 40
        constraintStackBottom.constant = isHidePayDecline ? 0 : 15
        
        let profileString = paymentRequest.fromUser?.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        nameLabel.text = "\(paymentRequest.fromUser?.firstName ?? "") \(paymentRequest.fromUser?.lastName ?? "")"
        
      let createdAt = paymentRequest.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        dateLabel.text = createdAt
        
        if let amount = paymentRequest.amount {
            let currencySymbol = Authorization.shared.userCredentials.country?.currencyCode ?? ""
            amountLabel.text = "\(currencySymbol) \(amount)"
        }
        
        titleLabel.text = paymentRequest.message
    }
    
    // MARK: - IBOutlet properties
    
    @IBAction func payButtonAction(_ sender: Any) {
        callbackPayButton?(tag)
    }
    
    @IBAction func declineButtonAction(_ sender: Any) {
        callbackDeclineButton?(tag)
    }
}
