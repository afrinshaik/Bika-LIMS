*** Settings ***

Library          Selenium2Library  timeout=10  implicit_wait=0.2
Library          String
Resource         keywords.txt
Resource         library-settings.txt
Resource         plone/app/robotframework/selenium.robot
Resource         plone/app/robotframework/saucelabs.robot
Variables        plone/app/testing/interfaces.py
Variables        bika/lims/tests/variables.py
Suite Setup      Start browser
Suite Teardown   Close All Browsers

*** Variables ***

${input_identifier} =  input#arimport_file

*** Test Cases ***

Test AR Importing dependencies
    Log in                      test_labmanager  test_labmanager
    Import Valid AR File
    Submit Valid AR File
    Import AR File with invalid filename 
    Import Invalid AR File

*** Keywords ***

Start browser
    Open browser                http://localhost:55001/plone/login
    Set selenium speed          ${SELENIUM_SPEED}

Import AR File with invalid filename 
    Go to                       http://localhost:55001/plone/clients/client-1
    Wait until page contains    Imports
    Import ARImport             ${PATH_TO_TEST_FILES}/Bika3ARImportInvalidFileName.csv
    sleep                       5s
    Page Should Contain         Error
    Page Should Contain         does not match entered filename
    
Import Invalid AR File
    Go to                       http://localhost:55001/plone/clients/client-1
    Wait until page contains    Imports
    Import ARImport             ${PATH_TO_TEST_FILES}/Bika3ARImportInvalid.csv
    sleep                       5s
    Page Should Contain         Invalid
    
Import Valid AR File
    Go to                       http://localhost:55001/plone/clients/client-1
    Wait until page contains    Imports
    Import ARImport             ${PATH_TO_TEST_FILES}/Bika3ARImportValid.csv
    sleep                       5s
    Page Should Contain         Valid
    
Submit Valid AR File
    Open Workflow Menu
    Click Link                  link=Submit ARImport
    Wait until page contains    View
    Page Should Contain         Submitted
    
    

Import ARImport
    [arguments]  ${file}

    Click Link                  Imports
    Wait until page contains    AR Import
    Click Link                  AR Import
    Wait until page contains    Import Analysis Request Data
    Click Button                xpath=/html/body/div/div[2]/div/div[2]/div[2]/div/form/div[2]/input
    Choose File                 css=${input_identifier}  ${file}
    Wait until page contains    Import Analysis Request Data
    Click Button                Import

HangOn
    Import library  Dialogs
    Pause execution

Open Add New Menu
    Open Menu  plone-contentmenu-factories

Open Workflow Menu
    Open Menu  plone-contentmenu-workflow

Open Menu
    [Arguments]  ${elementId}

    Element Should Be Visible  css=dl#${elementId} 
    Element Should Not Be Visible  css=dl#${elementId} dd.actionMenuContent
    Click link  css=dl#${elementId} dt.actionMenuHeader a
    Wait until keyword succeeds  5s  1s  Element Should Be Visible  css=dl#${elementId} dd.actionMenuContent

