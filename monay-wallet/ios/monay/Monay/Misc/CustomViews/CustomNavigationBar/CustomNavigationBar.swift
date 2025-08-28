//
//  CustomNavigationBar.swift
//  GoodGuysHomeServices
//
//  Created by Ankit Bhana on 25/05/19.
//  Copyright © 2019 Codiant Software Technologies. All rights reserved.
//

import UIKit

class CustomNavigationBar: UIView {

    @IBInspectable var paddingHeight: CGFloat = 0
    
    var height: CGFloat = 0
    
    override func awakeFromNib() {
        super.awakeFromNib()
        setHeight()
    }
    
    // MARK: - Helper methods
    private func setHeight() {
        let heightCustomNavigationBar = constraints.filter { $0.firstAttribute == .height }.first
        guard let heightConstraint = heightCustomNavigationBar else { return }
        height = CustomNavigationBar.getNavigationBarHeight() ?? 64
        heightConstraint.constant = height + paddingHeight
    }
    
    static func getNavigationBarHeight() -> CGFloat? {
        let window = UIApplication.shared.windows.filter {$0.isKeyWindow}.first
        var totalNavBarHeight: CGFloat = 0
        let navigationBarHeight: CGFloat = 44 // navigationController.navigationBar.bounds.height
        if #available(iOS 13.0, *) {
            let statusBarHeight = window?.windowScene?.statusBarManager?.statusBarFrame.height ?? 0
            totalNavBarHeight = statusBarHeight + navigationBarHeight
        } else {
            // Fallback on earlier versions
            let statusBarHeight = UIApplication.shared.statusBarFrame.height
            totalNavBarHeight = statusBarHeight + navigationBarHeight
        }
        return totalNavBarHeight
    }

}
