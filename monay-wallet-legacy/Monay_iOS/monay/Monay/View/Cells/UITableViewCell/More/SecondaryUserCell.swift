//
//  SecondaryUserCell.swift
//  Monay
//
//  Created by Aayushi Bhagat on 08/09/22.
//  Copyright © 2022 Codiant. All rights reserved.
//

import UIKit

class SecondaryUserCell: UITableViewCell {
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var mobileNumberLabel: UILabel!
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var transictionImage: UIImageView!
    @IBOutlet weak var transictionView: UIView!

    static let reuseIdentifier = "SecondaryUserCell"
    var callBack: (() -> Void)?

    func configure(_ data: SecondaryUser) {
      
      self.titleLabel.text = "\(data.user?.firstName ?? "") \(data.user?.lastName ?? "")"
      let number = data.user?.phoneNumber ?? ""
      let countryCode = data.user?.phoneNumberCountryCode ?? ""
      self.mobileNumberLabel.text = "\(countryCode) \(number.customFormatted)"
      let profileString = data.user?.profilePictureUrl ?? ""
      let profileUrl = URL(string: profileString)
      userImageView.setImageWithPlaceholder(with: profileUrl, placeholderImage: #imageLiteral(resourceName: "ic_place_holder"))
    }
    
      func configureParant(_ data: SecondaryUser) {
        
        self.titleLabel.text = "\(data.user?.firstName ?? "") \(data.user?.lastName ?? "")"
        let number = data.user?.phoneNumber ?? ""
        let countryCode = data.user?.phoneNumberCountryCode ?? ""
        self.mobileNumberLabel.text = "\(countryCode) \(number.customFormatted)"
        let profileString = data.user?.profilePictureUrl ?? ""
        let profileUrl = URL(string: profileString)
        userImageView.setImageWithPlaceholder(with: profileUrl, placeholderImage: #imageLiteral(resourceName: "ic_place_holder"))
      }
      
    @IBAction func icTransictionOnButton(_ sender: UIButton) {
      callBack?()
    }

  }

extension String {
    var customFormatted: String {
        let count = count
        return enumerated().map { $0.offset % 3 == 0 && $0.offset != 0 && $0.offset != count-1 || $0.offset == count && count % 3 != 0 ? "-\($0.element)" : "\($0.element)" }.joined()
    }

}
