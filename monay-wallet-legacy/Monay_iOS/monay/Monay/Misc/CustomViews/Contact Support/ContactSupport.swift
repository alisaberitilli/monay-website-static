//
//  SpecialInstruction.swift
//  GoodGuysServiceProviders
//
//  Created by WFH on 31/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit
import TTTAttributedLabel

class ContactSupport: UIView, TTTAttributedLabelDelegate {
    static let identifier = "ContactSupport"
    // MARK: - IBOutlet properties
    
    @IBOutlet weak var contactSupportLabel: TTTAttributedLabel!
    
    // MARK: - Instance properties
    
    var callbackContactSupport: (() -> Void)?
    
    enum AnimationDirection {
        case `in`, out  
    }
    
    static var popup: ContactSupport?
    
    static func showWith(completion: (() -> Void)?) {
        
        if popup != nil {
            popup!.removeFromSuperview()
            popup = nil
        }
        
      let nibObj = UINib(nibName: ContactSupport.identifier, bundle: nil).instantiate(withOwner: nil, options: nil)
        popup = nibObj.first as? ContactSupport
        popup!.frame = UIScreen.main.bounds
        popup!.callbackContactSupport = completion
        popup!.setupAttributeLabel()
        popup!.animate(.in)
    }
    
    private func setupAttributeLabel() {
        contactSupportLabel.numberOfLines = 0
        
        var attributedtext = NSAttributedString()
        var linkAttributes = [String: Any]()
        var rangeTC = NSRange()
        (attributedtext, linkAttributes, rangeTC) = setupAttributedLabel()
        
        contactSupportLabel.textAlignment = .center
        contactSupportLabel.attributedText = attributedtext
        
        contactSupportLabel.activeLinkAttributes = linkAttributes
        contactSupportLabel.linkAttributes = linkAttributes
        
      let urlTC = URL(string: LocalizedKey.actionCS.value)!
        contactSupportLabel.addLink(to: urlTC, with: rangeTC)
        contactSupportLabel.delegate = self
    }
    
    func setupAttributedLabel() -> (NSAttributedString, [String: Any], NSRange) { // swiftlint:disable:this large_tuple
        
      let strTC = LocalizedKey.contactSupport.value
      let string = "\(LocalizedKey.messageAccoountDisableByAdmin.value) \(strTC)"
      
      let nsString = string as NSString
      
      let paragraphStyle = NSMutableParagraphStyle()
      paragraphStyle.lineHeightMultiple = 1.2
      
      let fullAttributedString = NSAttributedString(string: string, attributes: [
        NSAttributedString.Key.paragraphStyle: paragraphStyle,
        NSAttributedString.Key.foregroundColor: #colorLiteral(red: 0, green: 0, blue: 0, alpha: 1),
        NSAttributedString.Key.font: UIFont.customFont(style: .regular, size: .custom(14.0))
      ])
      
      let rangeTC = nsString.range(of: strTC)
      
      let linkAttributes: [String: Any] = [
        NSAttributedString.Key.foregroundColor.rawValue: Color.blue.cgColor,
        NSAttributedString.Key.underlineStyle.rawValue: true
      ]
      
      return (fullAttributedString, linkAttributes, rangeTC)
    }
    
    func attributedLabel(_ label: TTTAttributedLabel!, didSelectLinkWith url: URL!) {
         
      if url.absoluteString == LocalizedKey.actionCS.value {
            callbackContactSupport?()
            ContactSupport.remove()
         }
     }
    
    static func remove() {
        guard let popup = popup else { return }
        popup.animate(.out)
    }
    
    private func animate(_ animationDirection: AnimationDirection) {
        
        DispatchQueue.main.async {
            guard let popup = ContactSupport.popup else { return }
            
            switch animationDirection {
            case .in:
                guard let keyWindow = UIApplication.shared.keyWindow else { return }
                popup.alpha = 0
                keyWindow.addSubview(popup)
                UIView.animate(withDuration: 0.2) {
                    popup.alpha = 1
                    
                }
                
            case .out:
                UIView.animate(withDuration: 0.1, animations: {
                    popup.alpha = 0
                }, completion: { (_) in
                    popup.removeFromSuperview()
                })
            }
        }
    }
    
    @IBAction func btnCross() {
        ContactSupport.remove()
    }
}
