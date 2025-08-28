//
//  UploadDocumentHeaderCell.swift
//  Monay
//
//  Created by Aayushi on 24/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class UploadDocumentHeaderCell: UITableViewCell {
    
    // MARK: - Type properties
    
    static let reuseIdentifier = "UploadDocumentHeaderCell"
    
    // MARK: - IBOutlet
    
    @IBOutlet weak var lblTitle: UILabel!
    
    // MARK: - Helper methods
    
    func configure(_ title: String) {
        lblTitle.text = title
    }
}
