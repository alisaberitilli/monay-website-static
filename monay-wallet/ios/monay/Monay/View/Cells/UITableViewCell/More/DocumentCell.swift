//
//  DocumentCell.swift
//  Monay
//
//  Created by Aayushi on 24/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class DocumentCell: UITableViewCell {

    static let reuseIdentifier = "DocumentCell"
  
    @IBOutlet weak var documentImageParentView: UIView!
    @IBOutlet weak var documentView: UIView!
    @IBOutlet weak var documentButton: UIButton!
    @IBOutlet weak var documentDeleteButton: UIButton!
    @IBOutlet weak var documentImageView: UIImageView!
    @IBOutlet weak var documentPreviewButton: UIButton!

    @IBOutlet weak var documentBottomMainView: UIView!
    @IBOutlet weak var documentBottomView: UIView!
    @IBOutlet weak var documentBottomBackgroundDashLineView: UIView!
    @IBOutlet weak var documentBottomImageView: UIImageView!
    @IBOutlet weak var documentBottomDeleteButton: UIButton!
    @IBOutlet weak var documentBottomButton: UIButton!
    @IBOutlet weak var documentBottomPreviewButton: UIButton!

    // MARK: - Instance properties
    
    var callback: ((DocumentCell) -> Void)?
    var callbackBottomSelectDoc: ((DocumentCell) -> Void)?
    var callbackBottomDelete: ((DocumentCell) -> Void)?

    var callbackDelete: ((DocumentCell) -> Void)?
    var callbackPreview: ((DocumentCell) -> Void)?
    var callbackBottomPreview: ((DocumentCell) -> Void)?

    override func awakeFromNib() {
        super.awakeFromNib()
        if Authorization.shared.userCredentials.countryCode.value == "+91" {
          documentBottomBackgroundDashLineView.addDashedBorder2()
        }
        documentImageParentView.addDashedBorder2()
    }

    override func setSelected(_ selected: Bool, animated: Bool) {
        super.setSelected(selected, animated: animated)

        // Configure the view for the selected state
    }

    // MARK: - Public Methods

    @IBAction func uploadBottomDocumentButton_Action(_ sender: UIButton) {
      callbackBottomSelectDoc?(self)
    }
  
    @IBAction func deleteBottomDocumentButton_Action(_ sender: UIButton) {
      callbackBottomDelete?(self)
    }
   
    @IBAction func uploadDocumentButton_Action(_ sender: UIButton) {
        callback?(self)
    }
  
    @IBAction func deleteDocumentButton_Action(_ sender: UIButton) {
        callbackDelete?(self)
    }
  
    @IBAction func documentPreviewButton_Action(_ sender: UIButton) {
        callbackPreview?(self)
    }

    @IBAction func documentBottomPreviewButton_Action(_ sender: UIButton) {
      callbackBottomPreview?(self)
    }

}
