//
//  NotificationCell.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class NotificationCell: UITableViewCell {

     // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var timeLabel: UILabel!
    @IBOutlet weak var userImageView: UIImageView!

    // MARK: - Type properties
    
    static let reuseIdentifier = "NotificationCell"
    static let name  = "{name}"
    static let reason  = "{reason}"
    // MARK: - Helper methods

    func configure(_ data: Notification) {
        
        let name = "\(data.user?.firstName ?? "") \(data.user?.lastName ?? "")"
      var message = data.message?.replacingOccurrences(of: NotificationCell.name, with: name)
      message = message?.replacingOccurrences(of: NotificationCell.reason, with: "")
        
        // swiftlint:disable:next line_length
        titleLabel.attributedText = message?.attributedString(message ?? "", titleColor: .black, subTitle: "", subTitleColor: .black, titleFontSize: 14.0, subtitleFontSize: 14.0, titleStyle: .medium, subtitleStyle: .medium, fontFamily: .ceraPro, textAlignment: .left, spacing: 5.0)
        
      let createdAt = data.createdAt?.UTCToLocal(format: DateFormate.ddMMMyyyyhhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        timeLabel.text = createdAt
        
        let profileString = data.profilePictureUrl ?? ""
        let profileUrl = URL(string: profileString)
        userImageView.setImageWithPlaceholder(with: profileUrl, placeholderImage: #imageLiteral(resourceName: "ic_place_holder"))
    }
}
