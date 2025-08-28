Monay Application

    Monay is a digital wallet application. There is two module Customer and Merchant
    Customer can send money, request money to monay user from his contact list
    and add money also can check the transaction history.
	Customer can request admin to withdraw money.
	Monay app provides authentication functionality ( Fingerprint, PIN & Password )


	Technology Stack -

    a)	Programming languages: Kotlin 1.3.70 or  Java
    b)	Toolkit: Android Studio 4.1.2  & Android Developer Tools
    c)	JDK: 9 version
    d)	SDK: Target Android SDK 30  and  Min SDK Version 21
    e)	Device Support: Android Lollipop and above(latest version is Android 11)
    f)	Architecture Pattern: MVVM
    g)	Push Notifications: Firebase For Android
    h)  Database: Room Architecture
    i)  Support SDK: Zendesk


    Four Code environment (build variants) are exists in build.gradle file.

    Every build type has same codebase and same UI behaviour with different compile configurations.

    1. dev - Codiant Environment
       When we select dev environment in build variants tab as a Active option then we got build for dev environment.
    2. staging - Codiant Staging Environment
       When we select staging environment in build variants tab as a Active option then we got build for codiant staging environment.
    3. client_staging - Client Staging Environment
       When we select client_staging environment in build variants tab as a Active then we got build for client_staging environment for client's server.
    4. production - Production Store Environment
       When we select production environment in build variants tab as a Active then we got build for production environment for final release ( Play Store ).

    Below are some Environment Build Configuration Fields we are using in BuildType
    a) Version code:-
     It is a special integer value which works as an internal version number. It is not visible to end users.
     Android system uses this number to protect against application downgrades — it is not possible to install new application with version code lower than in currently installed application.

    b) versionName :-
    It is a string used as the version number shown to users. This setting can be specified as a raw string or as a reference to a string resource.
     The value is a string so that you can describe the app version as a <major>. <minor>. ... The versionName has no purpose other than to be displayed to users.

    c) BuildConfigField :-
    Gradle allows buildConfigField lines to define constants. These constants will be accessible at runtime as static fields of the BuildConfig class
    BuildConfig includes some default fields such as DEBUG and FLAVOR but you can also add custom values via build. gradle .

    d) ResValue:-
    The resValue in the productFlavors creates a resource value. It can be any type of resource (string, dimen, color, etc.).
    This is similar to defining a resource in the appropriate file: e.g. defining string in a strings.xml file.
     The advantage being that the one defined in gradle can be modified based on your productFlavor/buildVariant.



    Architectural Pattern -

    MVVM architecture is a Model-View-ViewModel architecture that removes the tight coupling between each component. Most importantly, in this architecture,
    the children don't have the direct reference to the parent, they only have the reference by observables.

    Model : It represents the data and the business logic of the Android Application. It consists of the business logic - local and remote data source, model
    classes, repository.
    View : It consists of the UI Code(Activity, Fragment), XML. It sends the user action to the ViewModel but does not get the response back directly. To get
    the response, it has to subscribe to the observables which ViewModel exposes to it.
    ViewModel : It is a bridge between the View and Model(business logic). It does not have any clue which View has to use it as it does not have a direct reference
    to the View. So basically, the ViewModel should not be aware of the view who is
    interacting with. It interacts with the Model and exposes the observable that can be observed by the View. This is all about the MVVM


    Other useful features -

    1. Reactive programming with Kotlin Flows
    2. Google Material Design library
    3. Android architecture components to share ViewModels during configuration changes
    4. Edge To Edge Configuration
    4. Resource defaults
        themes.xml - app themes
        colors.xml - colors for the entire project
        styles.xml - widget styles


    Version control workflow -

    We loosely use the "Git flow" approach: master is the release
    branch - it should always be releasable, and only merged into
    when we have tested and verified that everything works and is
    good to go.

    Daily development is done in the development branch. Features,
    bugfixes and other tasks are done as branches off of develop,
    then merged back into develop directly or via pull requests.

    We use tag for versioning in Git before releasing a build to client.


    Project Setup -

    1. Download this repository extract and open the template folder on Android Studio
    2. Rename the app package com.monayuser
    3. Check if the manifest package was renamed along with the package in FileProvider for Camera.
    4. On app/build.gradle, change the applicationId to the new app package
    5. On app/build.gradle, update the dependencies Android Studio suggests
    6. On string.xml, set your application name
    7. On theme.xml & colors.xml set your application primary and secondary colors


    External dependencies -

    - Firebase for analytics, crash reports and cloud messaging. All our
      apps share a single Firebase project, see
      https://console.firebase.google.com/u/2/project/myproject
      It's configured clientside for all the app flavors in
      "google-services.json" in this repo. Update this each time a new
      system/app flavor is added.

    - Retrofit is a REST Client for Java and Android. It makes it relatively easy to retrieve and upload JSON
      (or other structured data) via a REST based webservice. In Retrofit you configure which converter is used
      for the data serialization. Typically for JSON you use GSon, but you can add custom converters to process
      XML or other protocols. Retrofit uses the OkHttp library for HTTP requests.

    - Glide is an Image Loader Library for Android developed by bumptech and is a library that is recommended by Google.
      It has been used in many Google open source projects including Google I/O 2014 official application. It provides
      animated GIF support and handles image loading/caching.

    - Zxing that is an Android QR code scanner library. This library helps to read QR code.

    - Google's libphonenumber is a great library but it has to major flaws when used on Android and it extract country code and region from number.

    - monthandyearpicker, Month and Year Picker allow user to pick only month and year

    - ConstraintLayout allows you to create large and complex layouts with a flat view hierarchy (no nested view groups).

    - lifecycle:extensions, Lifecycle-aware components perform actions in response to a change in the lifecycle status of
      another component, such as activities and fragments for applying app lock.

    - Image Cropper Powerful (Zoom, Rotation, Multi-Source), customizable (Shape, Limits, Style), optimized (Async, Sampling,
      Matrix) and simple image cropping library for Android.

    - Space Navigation is a library allowing easily integrate fully customizable Google [Spaces][1] like navigation to your app.

    - Rxjava, This module adds the minimum classes to RxJava that make writing reactive components in Android applications easy
      and hassle-free. More specifically, it provides a Scheduler that schedules on the main thread or any given Looper.