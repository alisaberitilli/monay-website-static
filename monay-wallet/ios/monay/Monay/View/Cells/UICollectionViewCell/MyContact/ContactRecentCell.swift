//
//  ContactRecentCell.swift
//  Monay
//
//  Created by WFH on 11/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class ContactRecentCell: UICollectionViewCell {
    
    static let identifier = "ContactRecentCell"
     // MARK: - IBOutlet properties
    
    @IBOutlet weak var userImageView: UIImageView!
    @IBOutlet weak var nameLabel: UILabel!
    
    // MARK: - Helper methods
    
    func configure(recentUser: User) {
        let profileString = recentUser.profilePictureUrl ?? ""
        if let profileUrl = URL(string: profileString) {
            userImageView.setImage(with: profileUrl)
        }
        
        nameLabel.text = recentUser.firstName
    }
}
