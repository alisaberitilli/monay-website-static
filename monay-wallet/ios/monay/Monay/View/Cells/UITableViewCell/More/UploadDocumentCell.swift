//
//  UploadDocumentCell.swift
//  Monay
//
//  Created by Aayushi on 24/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class UploadDocumentCell: UITableViewCell {

    static let reuseIdentifier = "UploadDocumentCell"

    @IBOutlet weak var lblTitle: UILabel!
    @IBOutlet weak var selectionButton: UIButton!

    var callback: ((UploadDocumentCell, String) -> Void)?

    override func awakeFromNib() {
        super.awakeFromNib()
        // Initialization code
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

    // MARK: - Public Methods
    
    func set(_ option: String, selectedOption: String) {
        lblTitle.text = option
        selectionButton.setImage(selectedOption == option ? #imageLiteral(resourceName: "ic_radio_active") : #imageLiteral(resourceName: "ic_radio_inactive"), for: .normal)
    }

    func set(_ option: String, isSelected: Bool) {
        lblTitle.text = option
        selectionButton.setImage(isSelected ? #imageLiteral(resourceName: "ic_radio_active") : #imageLiteral(resourceName: "ic_radio_inactive"), for: .normal)
    }

    @IBAction func selectionButton_Action(_ sender: UIButton) {
      callback?(self, lblTitle.text ?? "")
    }

}
