//
//  BiometricAuthentication.swift
//  Monay
//
//  Created by WFH on 29/09/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import LocalAuthentication

class BiometricAuthenticator: NSObject {
    
    // MARK: - Singleton
    public static let shared = BiometricAuthenticator()
    
    // MARK: - Private
    private override init() {}
}

// MARK: - Public

extension BiometricAuthenticator {
    
    /// checks if biometric authentication can be performed currently on the device.
    class func canAuthenticate() -> Bool {
        
        var isBiometricAuthenticationAvailable = false
        var error: NSError?
        
        if LAContext().canEvaluatePolicy(LAPolicy.deviceOwnerAuthentication, error: &error) {
            isBiometricAuthenticationAvailable = (error == nil)
        }
        return isBiometricAuthenticationAvailable
    }
    
    /// Check for biometric authentication
    class func authenticateWithBioMetrics(reason: String, fallbackTitle: String? = "", cancelTitle: String? = "", completion: @escaping (Result<Bool, AuthenticationError>) -> Void) {
        
        // reason
        let reasonString = reason.isEmpty ? BiometricAuthenticator.shared.defaultBiometricAuthenticationReason() : reason
        
        // context
        let context = LAContext()
        
        //        context.localizedFallbackTitle = fallbackTitle
        
        // cancel button title
        if #available(iOS 10.0, *) {
            context.localizedCancelTitle = cancelTitle
        }
        
        // authenticate
        BiometricAuthenticator.shared.evaluate(policy: .deviceOwnerAuthentication, with: context, reason: reasonString, completion: completion)
    }

    /// checks if device supports face id and authentication can be done
    func faceIDAvailable() -> Bool {
        let context = LAContext()
        var error: NSError?
        
        let canEvaluate = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: &error)
        if #available(iOS 11.0, *) {
            return canEvaluate && context.biometryType == .faceID
        }
        return canEvaluate
    }
    
    /// checks if device supports touch id and authentication can be done
    func touchIDAvailable() -> Bool {
        let context = LAContext()
        var error: NSError?
        
        let canEvaluate = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthentication, error: &error)
        if #available(iOS 11.0, *) {
            return canEvaluate && context.biometryType == .touchID
        }
        return canEvaluate
    }
    
    /// checks if device has faceId
    /// this is added to identify if device has faceId or touchId
    /// note: this will not check if devices can perform biometric authentication
    func isFaceIdDevice() -> Bool {
        let context = LAContext()
        _ = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: nil)
        if #available(iOS 11.0, *) {
            return context.biometryType == .faceID
        }
        return false
    }
    
    func isTouchIdDevice() -> Bool {
        let context = LAContext()
        _ = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthentication, error: nil)
        if #available(iOS 11.0, *) {
            return context.biometryType == .touchID
        }
        return false
    }
}

// MARK: - Private

extension BiometricAuthenticator {
    /// get authentication reason to show while authentication
    private func defaultBiometricAuthenticationReason() -> String {
        return faceIDAvailable() ? kFaceIdAuthenticationReason : kTouchIdAuthenticationReason
    }
    
    /// get passcode authentication reason to show while entering device passcode after multiple failed attempts.
    private func defaultPasscodeAuthenticationReason() -> String {
        return faceIDAvailable() ? kFaceIdPasscodeAuthenticationReason : kTouchIdPasscodeAuthenticationReason
    }
    
    /// evaluate policy
    private func evaluate(policy: LAPolicy, with context: LAContext, reason: String, completion: @escaping (Result<Bool, AuthenticationError>) -> Void) {
        
        context.evaluatePolicy(policy, localizedReason: reason) { (success, err) in
            DispatchQueue.main.async {
                if success {
                    completion(.success(true))
                } else {
                    let errorType = AuthenticationError.initWithError(err as! LAError) // swiftlint:disable:this force_cast
                    completion(.failure(errorType))
                }
            }
        }
    }
}
