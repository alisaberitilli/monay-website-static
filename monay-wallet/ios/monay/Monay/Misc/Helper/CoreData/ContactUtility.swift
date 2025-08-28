//
//  ContactUtility.swift
//  Monay
//
//  Created by Aayushi on 26/10/20.
//  Copyright © 2020 Codiant. All rights reserved.
//

import Foundation
import Contacts
import PhoneNumberKit

class ContactUtility: NSObject {
    
    // MARK: - Instance properties
    
    let contactStore = CNContactStore()
    let arrContactsDicts = NSMutableArray()
    
    // MARK: - Type properties
    
    static let sharedInstance: ContactUtility = {
        let instance = ContactUtility()
        return instance
    }()
    
    // MARK: - Helper methods
    
    func getContact() -> [CNContact] {
        var results:[CNContact] = []
        
        let keyToContactFetch: [Any] = [
            CNContactGivenNameKey,
            CNContactFamilyNameKey,
            CNContactMiddleNameKey,
            CNContactPhoneNumbersKey,
            CNContactEmailAddressesKey,
            CNContactThumbnailImageDataKey
        ]
        
        let fetchRequest = CNContactFetchRequest(keysToFetch: keyToContactFetch as! [CNKeyDescriptor])
        fetchRequest.sortOrder = CNContactSortOrder.userDefault
        
        do {
            try self.contactStore.enumerateContacts(with: fetchRequest, usingBlock: { (contact, stop) in
                results.append(contact)
            })
        } catch let error as NSError {
            print(error.localizedDescription)
        }
        
        return results
    }
    
    /// The method request asks for permission to access contacts
    /// - Parameter completionHandler: This closure returns a boolean when whole process is complete
    func requestedForAccess(complitionHandler: @escaping ( _ accessGranted: Bool) -> Void) {
        let authorizationStatus = CNContactStore.authorizationStatus(for: CNEntityType.contacts)
        
        switch authorizationStatus {
        case .authorized:
            complitionHandler(true)
        case .notDetermined:
            self.contactStore.requestAccess(for: CNEntityType.contacts  ) { [weak self] (access, accessError) in
                
                guard let `self` = self else {
                    return
                }
                
                if access {
                    complitionHandler(access)
                } else {
                    DispatchQueue.main.async {
                        let topVC = UIApplication.topViewController()
                        (topVC is MyContactVC || topVC is AddBlockContactVC || topVC is HomeVC || topVC is IntroductionVC) ? complitionHandler(access) : self.alertPromptToAllowContactAccessViaSetting()
                    }
                }
            }
        case .denied:
            complitionHandler(false)
        default:
            complitionHandler(false)
        }
    }
    
    func alertPromptToAllowContactAccessViaSetting() {
        Alert.showAlertWithMessageCallback(
            title: kProductName,
          message: LocalizedKey.grandUseContactPermission.value,
          actionArray: [LocalizedKey.ok.value, LocalizedKey.cancel.value],
            style: .alert) { (action) in
                
                switch action.title {
                case LocalizedKey.ok.value:
                    if let settings = URL(string: UIApplication.openSettingsURLString),
                        UIApplication.shared.canOpenURL(settings) {
                        UIApplication.shared.open(settings)
                    }
                default: break
                }
        }
    }
    
    func syncPhoneBookContactsWithLocalDB(completionHandler: @escaping (_ success:Bool, _ updatedContacts: [PhoneContact]) -> ()) {
        
        if (appDelegate.isContactSyncInProgress == false) {
            appDelegate.isContactSyncInProgress = true
            
            self.createDictOfContactList { [weak self] (arrDictContactList) in
                
                guard let `self` = self else {
                    return
                }
                
                DispatchQueue.global(qos: .background).async { [weak self] in
                    
                    guard let `self` = self else {
                        return
                    }
                    
                    let arrContactList =  CoreDataManager.sharedInstance.getObjectsforEntity(strEntity: "Contact", ShortBy: "", isAscending: false, predicate: nil, groupBy: "", taskContext: CoreDataManager.sharedInstance.bGManagedObjectContext) as! NSArray
                    
                    if arrContactList.count > 0 {
                        //Check for require update contact in db
                        let tempArrContactDict = self.arrContactsDicts
                        
                        for contact in arrContactList {
                            let tempContactDb = contact as! Contact
                            let mobileNumber = tempContactDb.mobileNumber
                            
                            if (mobileNumber != "") {
                                let arrFilterContact = self.arrContactsDicts.filter({($0 as! PhoneContact).mobileNumber! == mobileNumber!})
                                
                                if arrFilterContact.count > 0 {
                                    let filterdContact = arrFilterContact.first as! PhoneContact
                                    
                                    if (filterdContact.firstName != tempContactDb.firstName || filterdContact.lastName != tempContactDb.lastName || filterdContact.email != tempContactDb.email) {
                                        
                                        tempContactDb.firstName = filterdContact.firstName
                                        tempContactDb.lastName = filterdContact.lastName
                                        tempContactDb.email = filterdContact.email
                                        sharedCoreDataManager.saveContextInBG()
                                        //Update contact if it was updated in contact
                                    }
                                    tempArrContactDict.remove(arrFilterContact.first as Any)
                                } else {
                                    
                                    //                                This contact is not available in newContact dict so it means this contact is deleted in contact directory so we need to delete from out data base.
                                    sharedCoreDataManager.deleteObject(object: tempContactDb, taskContext: CoreDataManager.sharedInstance.bGManagedObjectContext)
                                    //Delete this contact from db
                                }
                            }
                        }
                        
                        if (tempArrContactDict.count > 0) {
                            //After sync new contact list with local db there is still contact is avalilabe in contact dict so it means there is newly insertad contact so insert new contact in the local data base
                            let updatedContact = tempArrContactDict as! [PhoneContact]
                            self.saveNewContactInDb(dict:tempArrContactDict, completionHandler: { (success) in
                                completionHandler(true, updatedContact)
                            })
                        } else {
                            completionHandler(true, [])
                        }
                    } else {
                        //Save all new contact in db
                        self.saveNewContactInDb(dict: self.arrContactsDicts, completionHandler: { (success) in
                            completionHandler(true, [])
                        })
                    }
                }
            }
        }
    }
    
    func saveApiAppUserStatusInDB(users: [User], completionHandler: @escaping () -> ()) -> Void {
        
        let context = CoreDataManager.sharedInstance.bGManagedObjectContext
        let dbContacts = CoreDataManager.sharedInstance.getObjectsforEntity(
            strEntity: LocalizedKey.contact.value,
            ShortBy: "",
            isAscending: false,
            predicate: nil,
            groupBy: "",
            taskContext: context) as! NSArray
        
        guard dbContacts.count > 0 else {
            return
        }
        
//        DispatchQueue.global(qos: .userInitiated).async {
            
            for dbcontact in dbContacts {
                let tempdbContact = dbcontact as? Contact
                
                for user in users {
                    
                  if tempdbContact?.mobileNumber == user.phoneNumber {
                        
                    tempdbContact?.firstName = user.firstName ?? "-"
                    tempdbContact?.lastName = user.lastName ?? ""
                    tempdbContact?.mobileNumber = user.phoneNumber ?? "-"
                    tempdbContact?.countryCode = user.phoneNumberCountryCode ?? "-"
                    tempdbContact?.isAppUser = true
                    }
                }
            }
        sharedCoreDataManager.saveContextInBG()
            completionHandler()
//        }
    }
    
    func saveNewContactInDb(dict:NSMutableArray, completionHandler:@escaping (_ success:Bool) -> ()) -> Void {
            
            for newContact in dict {
                let tempContact = newContact as! PhoneContact
                
                let firstName = tempContact.firstName ?? ""
                let lastName = tempContact.lastName ?? ""
                
                if firstName.isEmpty &&
                    lastName.isEmpty {
                    continue
                }
                
                let objContact = (CoreDataManager.sharedInstance.createObjectForEntity(
                                    entityName: LocalizedKey.contact.value,
                    taskContext: sharedCoreDataManager.bGManagedObjectContext)) as! Contact
                
                objContact.firstName = firstName
                objContact.lastName = lastName
                objContact.mobileNumber = tempContact.mobileNumber ?? ""
                objContact.countryCode = tempContact.countryCode ?? ""
                objContact.isAppUser = tempContact.isAppUser ?? false
            }
        
        sharedCoreDataManager.saveContextInBG()
            completionHandler(true)
    }
    
    func createDictOfContactList(compilationClosure: @escaping (_ arrContectDict: NSMutableArray) -> ()) {
        self.arrContactsDicts.removeAllObjects()
        
        DispatchQueue.global(qos: .background).async { [weak self] in
            
            guard let `self` = self else {
                return
            }
            
            self.requestedForAccess { [weak self] (accessGranted) in
                
                guard let `self` = self else {
                    return
                }
                
                if (accessGranted) {
                    for contact in self.getContact()
                    {
                        for tempContact: CNLabeledValue in contact.phoneNumbers
                        {
                          if contact.givenName.lowercased() == LocalizedKey.spam.value ||
                              contact.givenName.lowercased() == LocalizedKey.identifiedSpam.value {
                                continue
                            }
                            
                            let emailAddress = ""
                            
                            self.getFinalNumber(tempContact, compilationClosure: { [weak self] (finalNumber, countryCode) in
                                
                                guard let `self` = self else {
                                    return
                                }
                                
                                if (finalNumber != "") {
                                    
                                    let dict = PhoneContact(firstName: contact.givenName,
                                                            lastName: contact.familyName,
                                                            countryCode: countryCode,
                                                            mobileNumber: finalNumber,
                                                            email: emailAddress,
                                                            userImage: Data(),
                                                            isAppUser: false)
                                    
                                    self.arrContactsDicts.add(dict)
                                }
                            })
                        }
                    }
                    compilationClosure(self.arrContactsDicts)
                } else {
                    compilationClosure([])
                }
            }
        }
    }
    
    func getFinalNumber(_ phoneNumber: CNLabeledValue<CNPhoneNumber>, compilationClosure: @escaping (_ finalNumber: String, _ countryCode: String) ->()) {
        
      
        let phoneDigits = digitsForPhone(phoneNumber)
        let countryRegionCode = countryRegionCodeForPhone(phoneNumber)

        var nationalPhoneNumber = ""
        var countryCode = ""
        
        let phoneKit = PhoneNumberKit()
        
        do {
            let phoneNumber = try phoneKit.parse(phoneDigits, withRegion: countryRegionCode)
            countryCode = String(phoneNumber.countryCode)
            nationalPhoneNumber = String(phoneNumber.nationalNumber)
        } catch {
            print(error.localizedDescription)
        }
        
        if !countryCode.isEmpty {
            countryCode = "+\(countryCode)"
        }
        
        compilationClosure(nationalPhoneNumber, countryCode)
    }
    
    /// The method gives plain numbers (without masking) from Phone Book phone number
    ///
    /// - Parameter phoneNumber: Phone Book contat Phone number
    /// - Returns: phone number without masking
    
    func digitsForPhone(_ phoneNumber: CNLabeledValue<CNPhoneNumber>) -> String {
        
      guard let strPhoneNumber = (phoneNumber.value as CNPhoneNumber).value(forKey: LocalizedKey.digit.value) as? String else {
            return ""
        }
        
        return strPhoneNumber
    }
    
    func countryRegionCodeForPhone(_ phoneNumber: CNLabeledValue<CNPhoneNumber>) -> String {
        
      guard let countryRegionCode = (phoneNumber.value as CNPhoneNumber).value(forKey: LocalizedKey.countryCode.value) as? String else {
            return ""
        }
        
        return countryRegionCode
    }
}
