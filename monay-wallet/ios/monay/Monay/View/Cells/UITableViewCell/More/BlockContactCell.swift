//
//  BlockContactCell.swift
//  Monay
//
//  Created by WFH on 11/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class BlockContactCell: UITableViewCell {
    
    static let identifier = "BlockContactCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var userNameLabel: UILabel!
    @IBOutlet weak var userNumberLabel: UILabel!
    @IBOutlet weak var blockUnblockButton: UIButton!
    @IBOutlet weak var underlineView: UIView!
    @IBOutlet weak var constraintBlockUnblockViewWidth: NSLayoutConstraint!
    
    // MARK: - Instance properties
    
    var callbackBlockUnblock: ((Int) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(user: User) {
        
        if let profilePictureUrl = URL(string: user.profilePictureUrl ?? "") {
            userImageView.setImage(with: profilePictureUrl)
        } else {
            userImageView.image =  #imageLiteral(resourceName: "ic_place_holder")
        }
        
        userNameLabel.text = (user.firstName ?? "") + " " + (user.lastName ?? "")
        userNumberLabel.text = (user.phoneNumberCountryCode ?? "") + " " + (user.phoneNumber ?? "")
    }
    
    // MARK: - IBAction methods
    
    @IBAction func blockUnblockButtonAction(_ sender: UIButton) {
        callbackBlockUnblock?(sender.tag)
    }
}
