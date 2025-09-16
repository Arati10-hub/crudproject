Feature: Login functionality

  Scenario: Successful login with valid credentials
    Given I am on the login page
    When I enter username "rohitagent" and password "Rohit@123"
    And I click the login button
    Then I should be redirected to the dashboard



  Scenario: Failed login with invalid credentials
    Given I am on the login page
    When I enter username "wronguser" and password "Wrong@123"
    And I click the login button
    Then I should see an error message "Username or Password Incorrect"




  Scenario: Field validation for empty credentials
    Given I am on the login page
    When I leave both username and password fields empty
    And I click the login button
    Then I should see field validation messages for required fields



