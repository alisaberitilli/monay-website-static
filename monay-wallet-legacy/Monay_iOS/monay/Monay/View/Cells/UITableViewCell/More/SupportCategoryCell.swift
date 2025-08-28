//
//  SupportCategoryCell.swift
//  Monay
//
//  Created by WFH on 26/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SupportCategoryCell: UITableViewCell {
      
      static let identifier = "SupportCategoryCell"
     // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    
    // MARK: - Helper methods
    
    func configure(category: SupportCategory) {
        titleLabel.text = category.title
    }
}
