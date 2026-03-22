Feature: Question Management
  As a professor
  I want to create, update, and delete questions with alternatives
  So that I can build a question bank for exams

  Scenario: Create a question
    Given the system has no questions
    When I create a question with statement "What is 2 + 2?"
    Then the question list contains 1 question
    And the question statement is "What is 2 + 2?"

  Scenario: Update a question statement
    Given there is a question with statement "Old statement"
    When I update the question statement to "New statement"
    Then the question statement is "New statement"

  Scenario: Delete a question
    Given there is a question with statement "To be deleted"
    When I delete the question
    Then the question list contains 0 questions

  Scenario: Add an alternative to a question
    Given there is a question with statement "What color is the sky?"
    When I add an alternative with description "Blue" marked as correct
    Then the question has 1 alternative
    And the alternative description is "Blue"
    And the alternative is marked as correct

  Scenario: Update an alternative
    Given there is a question with an alternative "Wrong description" marked as incorrect
    When I update the alternative description to "Right description" and mark it as correct
    Then the alternative description is "Right description"
    And the alternative is marked as correct

  Scenario: Remove an alternative from a question
    Given there is a question with an alternative "To remove"
    When I delete the alternative
    Then the question has 0 alternatives

  Scenario: Cannot create a question with empty statement
    When I try to create a question with an empty statement
    Then I receive an error
