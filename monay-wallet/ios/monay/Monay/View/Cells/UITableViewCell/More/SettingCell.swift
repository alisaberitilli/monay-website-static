//
//  SettingCell.swift
//  Monay
//
//  Created by Aayushi on 30/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SettingCell: UITableViewCell {

    static let reuseIdentifier = "SettingCell"

    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var icnOption: UIImageView!

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

    // MARK: - Public Methods
    
    func set(_ option: SettingOption) {
        lblTitle.text = option.title
        icnOption.image = UIImage(named: option.iconName)
    }

}
