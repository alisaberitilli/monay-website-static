# Monay

- [Features](#features)
- [Directory Structure](#directory-structure)
- [Requirements](#requirements)
- [Technical stacks](#technical-stacks)
- [Dependency Manager](#dependency-manager)
- [Dependencies](#dependencies)

## Features

-  QR code and do the payments
-  Add money to their wallet balance
-  Send money from wallet
-  Request for withdrawal
-  KYC feature

## Directory Structure

Root
└── Monay
│           ├ Configuration
│           │      └── xconfig files: Manage configuration and credentials for different env/stages.
│           │
│           ├ APIManager
│           │     └── Core:  REST based web service component/library. 
│           │     └── Workers: API endpoints used in application and are separated by components.
│           │
│           ├── Model: Contains all the model classes used to handle web services response.
│           ├── View: The .xib files used for designing/layout/appearance and their respective swift file.
│           │
│           ├── Resources
│           │      └── Font: Contains all custom font files used in application.
 │          │
│           ├── Misc: Contains Helpers, Extensions, Validators and Constant files.
│           ├── Localisation: Localisation strings files.
│           │
│           ├── Root
│           │         └── LoggedOut: Components used before login into the application.
│           │         └── LoggedIn: Components used after login into the application.
│           │         └── Component: Each component is structured in MVVM architecture (View Model & View Controller).
│           │
│           ├── Storyboards: Storyboard files.
│           ├── Application: Contains AppDelegate and SceneDelegate of application.
│           ├── Assets.xcassets: Contains all the image assets used in the application. 
├── .gitignore
├── .swiftlint.yml: [SwiftLint](https://github.com/realm/SwiftLint) configuration file. Include all set of code linting rules. 
├── Pods: Contains dependencies installed by [cocoapods](#cocoapods).
└── Podfile: Declares the dependencies of the project.

## Requirements

| Platform | Minimum Deployment Target | Minimum Swift Version | Dependency Manager |
| --- | ---  | --- | --- |
| iOS | 12.0 | 4.0 | [cocoapods](#cocoapods) |

## Technical stacks
1. Programming Language: Swift 4.0+
2. IDE: Xcode 12
3. Device support: Requires iOS 12.0 or later
4. Architecture Pattern: MVVM + [ReactiveX](https://github.com/ReactiveX/RxSwift)
5. Push Notifications: APS (Apple Push Services) using Google Firebase
6. [SwiftLint](https://github.com/realm/SwiftLint): Code linting tool

## Dependency Manager
### [cocoapods](https://cocoapods.org)

cocoapods is a dependency manager for Cocoa projects. For usage and installation instructions, visit their website. To integrate Pod into your Xcode project using CocoaPods, specify it in your `Podfile`:

### Dependencies:

**TTTAttributedLabel**
[TTTAttributedLabel](https://github.com/TTTAttributedLabel/TTTAttributedLabel)
TTTAttributedLabel is a drop-in replacement for UILabel providing a simple way to performantly render attributed strings. As a bonus, it also supports link embedding, both automatically with NSTextCheckingTypes and manually by specifying a range for a URL, address, phone number, event, or transit information.

**IQKeyboardManager**
[IQKeyboardManager](https://github.com/hackiftekhar/IQKeyboardManager)
IQKeyboardManager allows you to prevent this issue of keyboard sliding up and covering UITextField/UITextView without needing you to write any code or make any additional setup. To use IQKeyboardManager you simply need to add source files to your project.

IQKeyboardManager works on all orientations, and with the toolbar. It also has nice optional features allowing you to customize the distance from the text field, behaviour of previous, next and done buttons in the keyboard toolbar, play sound when the user navigates through the form and more.

**TagListView**
[TagListView](https://github.com/ElaWorkshop/TagListView)
Simple and highly customizable iOS tag list view, in Swift.
Supports Storyboard, Auto Layout, and @IBDesignable.
Usage -
The most convenient way is to use Storyboard. Drag a view to Storyboard and set Class to TagListView (if you use CocoaPods, also set Module to TagListView). Then you can play with the attributes in the right pane, and see the preview in real time thanks to @IBDesignable.

**ActionSheetPicker-3.0**
[ActionSheetPicker-3.0](https://github.com/skywinder/ActionSheetPicker-3.0)
Easily present an ActionSheet with a PickerView, allowing the user to select from a number of immutable options.
Benefits

* Spawn pickers with convenience function - delegate or reference not required. Just provide a target/action callback.
* Add buttons to UIToolbar for quick selection (see ActionSheetDatePicker below).
* Delegate protocol available for more control.
* Universal (iPhone/iPod/iPad).

**SwiftLint**
[SwiftLint](https://github.com/realm/SwiftLint)

A tool to enforce Swift style and conventions, loosely based on the now archived GitHub Swift Style Guide. SwiftLint enforces the style guide rules that are generally accepted by the Swift community. These rules are well described in popular style guides like [Ray Wenderlich's Swift Style Guide](https://github.com/raywenderlich/swift-style-guide).

**Kingfisher**
[Kingfisher](https://github.com/onevcat/Kingfisher)
Kingfisher is a powerful, pure-Swift library for downloading and caching images from the web. It provides you a chance to use a pure-Swift way to work with remote images in your next app.

**ObjectMapper**
[ObjectMapper](https://github.com/tristanhimmelman/ObjectMapper)
ObjectMapper is a framework written in Swift that makes it easy for you to convert your model objects (classes and structs) to and from JSON.
Features:
* Mapping JSON to objects
* Mapping objects to JSON
* Nested Objects (stand alone, in arrays or in dictionaries)
* Custom transformations│dur─ g mapping
* Struct support

**JWTDecode**
[JWTDeco](https://github.com/auth0/JWTDecode.swift)
A library to help you decode JWTs in Swift, also help you check JWT [JWT](https://jwt.io) payload.

**KeychainAccess**
[KeychainAccess](https://github.com/kishikawakatsumi/KeychainAccess)
KeychainAccess is a simple Swift wrapper for Keychain that works on iOS and OS X. Makes using Keychain APIs extremely easy and much more palatable to use in Swift.

**RxSwift**
[RxSwift](https://github.com/ReactiveX/RxSwift)
RxSwift is the Swift-specific implementation of the [Reactive Extensions](http://reactivein.jio) standard.
Like other Rx implementation, RxSwift's intention is to enable easy composition of asynchronous operations and streams of data in the form of Observable obsects and a │uite of methods to transform and compose these pieces of asynchronous work.│
**RxOptional**
[RxOptional](https://github.com/RxSwiftCommunity/RxOptional)
RxSwift extensions for Swift optionals and "Occupiable" types.

**RxViewModel**
[RxViewModel](https://github.com/RxSwiftCommunity/RxViewModel)

It basically adds a new «separation layer» to break down the MVC pattern into more manageable pieces.
MVC on Cocoa hast always been a pain because it always translates to «Massive View Controller» due to the need to many delegates that are usually implemented by one controller (e.g. when binding a tableview where you need a delegate for the tableview and also a delegate for the data source, etc).

MVVM separates the View from the Model via an «intermediate» class named ViewModel.

This intermediate class allows the binding of the View and the Model in a more clean and easy manner and also separates some logic as to how/when to load└the─datanremoveng that responsability from the View a.j leaving pretty much only the UI specific code in it.

**CocoaLumberjack**
[CocoaLumberjack](https://github.com/CocoaLumberjack/CocoaLumberjack)
A fast & simple, yet powerful & fls
ible logging framework for Mac and iOS
First, install CocoaLumber└ack via CocoaPod─. Then use DDOSLogger for iOS 10 and later, or DDTTYLogger and DDASLLogger for earlier versions to begin logging messages.─
**Firebase**
[Firebase](https://github.com/firebase/firebase-ios-sdk)
Firebase is an app development platform with tools to help you build, grow and monetize your app. Moredxxformation about Firebase can be foun. on thj [official Firebase website](https://firebasegoogle.com).
Collection of quickstart samples demonstrating the Firebase APIs on iOS. Each sample contains targets for both Obective-C and Swift. For more information, see [official Firebase website](https://firebase.google.com).

**Firebase/Crashlytics**
[Firebase/Crashlytics](https://github.com/firebase/firebase-ios-dk/tree/master/Crashlytics)
Follow the subsequent instructions to develop, debug, unit test, and integration test FirebaseCrashlytics:

**PhoneNumberKit**
[PhoneNumberKit](https://github.com/marmelroy/PhoneNumberKit)
A Swift framework for parsing, formatting and validating international phone numbers. Inspired by Google's libphonenumber.
Import PhoneNumberKit at the top of the Swift file that will interact with a phone number.

**libPhoneNumber**
[libPhoneNumber](https://github.com/iziz/libPhoneNumber-iOS)
iOS port from libphonenumber (Google's phone number handling library).
For more information on libPhoneNumberGeocoding and its usage, please visit [libPhoneNumberGeocoding](https://github.com/iziz/libPhoneNumber-iOS/blob/master/libPhoneNumberGeocoding/README.md) for more information.

**ZendeskSDK**
[ZendeskSDK](https://github.com/zendesk/support_sdk_ios)
Zendesk Support SDK for mobile is a quick, convenient way to get customer support into your mobile apps. With just a few lines of code, you can provide your end users with an easy way to get in touch from any mobile app.
You can find documentation for the SDK and release notes on [link](https://developer.zendesk.co

