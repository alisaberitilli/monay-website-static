//
//  PendingRequestCell.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class PendingRequestCell: UITableViewCell {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var timeLabel: UILabel!
    
    // MARK: - Type properties
    
    static let reuseIdentifier = "PendingRequestCell"
    
    // MARK: - Helper methods
    
    func configure(_ data: SupportRequest) {
        titleLabel.text = data.message
      let createdAt = data.createdAt?.UTCToLocal(format: DateFormate.hhmma.rawValue, sourceFormat: DateFormate.yyyyMMddT.rawValue)
        timeLabel.text = createdAt
    }
}
