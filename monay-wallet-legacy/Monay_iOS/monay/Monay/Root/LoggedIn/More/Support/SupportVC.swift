//
//  SupportVC.swift
//  Monay
//
//  Created by Aayushi on 19/08/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import UIKit

class SupportVC: UIViewController {

    // MARK: - IBOutlets
    
    @IBOutlet weak var backButton: UIButton!
    @IBOutlet weak var lineLeadingConstraints: NSLayoutConstraint!
    @IBOutlet weak var pendingButton: UIButton!
    @IBOutlet weak var closedButton: UIButton!
    @IBOutlet weak var containerView: UIView!

    // MARK: - Instance properties

    override func viewDidLoad() {
        super.viewDidLoad()
        pendingRequestViewControlller()
    }
    
    // MARK: - Private Methods
    
    private func pendingRequestViewControlller() {
        let controller = StoryboardScene.More.instantiateViewController(withClass: PendingRequestVC.self)
        addChild(controller)
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(controller.view)
        
        NSLayoutConstraint.activate([
            controller.view.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 0),
            controller.view.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: 0),
            controller.view.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 0),
            controller.view.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: 0)
        ])
        
        controller.didMove(toParent: self)
    }
    
    private func closeRequestViewControlller() {
        let controller = StoryboardScene.More.instantiateViewController(withClass: ClosedRequestVC.self)
        addChild(controller)
        controller.view.translatesAutoresizingMaskIntoConstraints = false
        containerView.addSubview(controller.view)
        
        NSLayoutConstraint.activate([
            controller.view.leadingAnchor.constraint(equalTo: containerView.leadingAnchor, constant: 0),
            controller.view.trailingAnchor.constraint(equalTo: containerView.trailingAnchor, constant: 0),
            controller.view.topAnchor.constraint(equalTo: containerView.topAnchor, constant: 0),
            controller.view.bottomAnchor.constraint(equalTo: containerView.bottomAnchor, constant: 0)
        ])
        
        controller.didMove(toParent: self)
    }

    private func setButtonTextColor(_ type: SupportType) {
      self.view.endEditing(true)
      pendingButton.setTitleColor(#colorLiteral(red: 0.6588235294, green: 0.6588235294, blue: 0.6588235294, alpha: 1), for: .normal)
      closedButton.setTitleColor(#colorLiteral(red: 0.6588235294, green: 0.6588235294, blue: 0.6588235294, alpha: 1), for: .normal)
      switch type {
      case .pending:
        pendingButton.setTitleColor(#colorLiteral(red: 0.03137254902, green: 0.6666666667, blue: 1, alpha: 1), for: .normal)
        lineLeadingConstraints.constant = pendingButton.frame.origin.x
        UIView.animate(withDuration: 0.3) {
          self.view.layoutIfNeeded()
        }
        pendingRequestViewControlller()
      case .closed:
        closedButton.setTitleColor(#colorLiteral(red: 0.03137254902, green: 0.6666666667, blue: 1, alpha: 1), for: .normal)
        lineLeadingConstraints.constant = closedButton.frame.origin.x
        UIView.animate(withDuration: 0.3) {
          self.view.layoutIfNeeded()
        }
        closeRequestViewControlller()
      }
    }

    // MARK: - IBAction

    @IBAction func pendingButton_Action(_ sender: UIButton) {
        self.setButtonTextColor(.pending)
    }

    @IBAction func closedButton_Action(_ sender: UIButton) {
        self.setButtonTextColor(.closed)
    }

}
