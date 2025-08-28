//
//  RequestDeclineVC.swift
//  Monay
//
//  Created by WFH on 11/11/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class RequestDeclineVC: UIViewController {
    
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var titleLabel: UILabel!
    @IBOutlet weak var reasonTextView: KMPlaceholderTextView!
    
    // MARK: - Instance properties
    
    var onCompleteRequestDecline: ((String) -> Void)?
    var onCrossClick: (() -> Void)?
    
    // MARK: - View controller lifecycle methods
    
    override func viewDidLoad() {
        super.viewDidLoad()
        initialSetup()
    }
    
    // MARK: - Private helper methods
    
    private func initialSetup() {
        setupUI()
    }
    
    private func setupUI() {
        let attribute = [NSAttributedString.Key.font: UIFont.customFont(style: .medium, size: .custom(18))]
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.lineSpacing = 8
        
      let attributeString = NSMutableAttributedString(string: LocalizedKey.sureDeclineRequest.value, attributes: attribute)
        attributeString.addAttribute(NSAttributedString.Key.paragraphStyle, value: paragraphStyle, range: NSMakeRange(0, attributeString.length)) // swiftlint:disable:this legacy_constructor
        titleLabel.attributedText = attributeString
        titleLabel.textAlignment = .center
    }
    
    // MARK: - IBAction methods
    
    @IBAction func noButtonAction(_ sender: Any) {
        dismiss()
        onCrossClick?()
    }
    
    @IBAction func yesButtonAction(_ sender: Any) {
        dismiss()
        onCompleteRequestDecline?(reasonTextView.text ?? "")
    }
}
