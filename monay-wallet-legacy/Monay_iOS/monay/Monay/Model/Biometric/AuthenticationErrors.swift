//
//  AuthenticationErrors.swift

import Foundation
import LocalAuthentication

/// Authentication Errors
public enum AuthenticationError: Error {
    
    case failed, canceledByUser, fallback, canceledBySystem, passcodeNotSet, biometryNotAvailable, biometryNotEnrolled, biometryLockedout, other
    
    public static func initWithError(_ error: LAError) -> AuthenticationError {
        switch Int32(error.errorCode) {
            
        case kLAErrorAuthenticationFailed:
            return failed
        case kLAErrorUserCancel:
            return canceledByUser
        case kLAErrorUserFallback:
            return fallback
        case kLAErrorSystemCancel:
            return canceledBySystem
        case kLAErrorPasscodeNotSet:
            return passcodeNotSet
        case kLAErrorBiometryNotAvailable:
            return biometryNotAvailable
        case kLAErrorBiometryNotEnrolled:
            return biometryNotEnrolled
        case kLAErrorBiometryLockout:
            return biometryLockedout
        default:
            return other
        }
    }
}
