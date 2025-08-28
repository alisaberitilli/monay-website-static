//
//  AddNewCardCell.swift
//  Monay
//
//  Created by WFH on 20/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class AddNewCardCell: UITableViewCell {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var rightArrowImageView: UIImageView!
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var selectionButton: UIButton!
    
    // MARK: - Instance properties
    
    var callbackSelection: (() -> Void)?
    
    // MARK: - IBAction methods
    
    @IBAction func selectionButtonAction(_ sender: Any) {
        callbackSelection?()
    }
}
