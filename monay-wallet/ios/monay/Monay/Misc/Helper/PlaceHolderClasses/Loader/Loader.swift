//
//  PlaceHolderLoader.swift
//
//  Copyright © 2017 Codiant. All rights reserved.
//

import UIKit

class PlaceHolderLoader : UIView {

    lazy var activityIndicator: UIActivityIndicatorView = {
        var actInd = UIActivityIndicatorView()
        actInd.frame = self.bounds
        actInd.style = .whiteLarge
        actInd.transform = CGAffineTransform(scaleX: 0.7, y: 0.7)
        actInd.color = .gray
        actInd.backgroundColor = .clear
        return actInd
    }()

    required public init?(coder aDecoder: NSCoder) {
        super.init(coder: aDecoder)
        backgroundColor = .clear
    }

    override public init(frame: CGRect) {
        super.init(frame: frame)
    }

    open override func layoutSubviews() {
        super.layoutSubviews()
    }

    func startAnimating() {
        self.addSubview(activityIndicator)
        activityIndicator.startAnimating()
    }

    func stopAnimating(){
        activityIndicator.stopAnimating()
        activityIndicator.removeFromSuperview()
    }
}
