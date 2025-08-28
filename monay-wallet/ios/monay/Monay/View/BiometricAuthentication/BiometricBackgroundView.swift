//
//  Copyright © 2020 Codiant Software Technologies. All rights reserved.
//

import UIKit

class BiometricBackgroundView: UIView {
    
    static let identifier = "BiometricBackgroundView"
    // MARK: - Type properties
    
    static var biometricBackgroundView: BiometricBackgroundView!
    var callback: ((String) -> Void)?
    
    // MARK: - Helper Methods
    
    static func show(completion: ((String) -> Void)?) {
        
        if biometricBackgroundView != nil {
            biometricBackgroundView.removeFromSuperview()
            biometricBackgroundView = nil
        }
        
      let nib = UINib(nibName: BiometricBackgroundView.identifier, bundle: nil)
        biometricBackgroundView = nib.instantiate(withOwner: self, options: nil).first as? BiometricBackgroundView
        biometricBackgroundView.frame = UIScreen.main.bounds
        biometricBackgroundView.callback = completion
        UIApplication.shared.keyWindow?.addSubview(biometricBackgroundView)
        biometricBackgroundView.setBiometricAuthentication()
    }
    
    private func setBiometricAuthentication() {
            BiometricAuthenticator.authenticateWithBioMetrics(reason: "") { (result) in
                
                switch result {
                case .success:
                    self.callback?(APIKey.success)
                    self.remove()
                case .failure:
                  self.callback?(APIKey.failure)
                    self.remove()
                }
        }
    }
    
    private func remove() {
        BiometricBackgroundView.biometricBackgroundView.removeFromSuperview()
        BiometricBackgroundView.biometricBackgroundView = nil
    }
}
