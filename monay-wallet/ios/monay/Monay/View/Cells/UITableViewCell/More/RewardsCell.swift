//
//  RewardsCell.swift
//  Monay
//
//  Created by Aayushi on 21/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class RewardsCell: UITableViewCell {

  @IBOutlet weak var nameLabel: UILabel!
  @IBOutlet weak var timeLabel: UILabel!
  @IBOutlet weak var amountLabel: UILabel!
  @IBOutlet weak var userImageView: UIImageView!

  static let reuseIdentifier = "RewardsCell"

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

  func configure(_ data: Rewards) {
    nameLabel.text = data.name
    timeLabel.text = data.dateTime
    amountLabel.text = data.amount
  }

}
