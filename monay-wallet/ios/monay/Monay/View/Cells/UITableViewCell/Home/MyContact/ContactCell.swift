//
//  ContactCell.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ContactCell: UITableViewCell {
    
    static let identifier = "ContactCell"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var userNameLabel: UILabel!
    @IBOutlet weak var userNumberLabel: UILabel!
    @IBOutlet weak var inviteButton: UIButton!

    // MARK: - Instance properties
    
    var callbackInvite: ((ContactCell) -> Void)?
    
    // MARK: - Helper methods
    
    func configure(contact: Contact) {
        if let avatarData = contact.userImage {
            userImageView.image =  UIImage(data: avatarData)
        } else {
            userImageView.image =  #imageLiteral(resourceName: "ic_place_holder")
        }
        
      userNameLabel.text = (contact.firstName ?? "") + " " + (contact.lastName ?? "")
      userNumberLabel.text = (contact.countryCode ?? "") + " " + (contact.mobileNumber ?? "")
      inviteButton.isHidden = contact.isAppUser
    }
  
    @IBAction func inviteButton_Action(_ sender: UIButton) {
      callbackInvite?(self)
    }
}
