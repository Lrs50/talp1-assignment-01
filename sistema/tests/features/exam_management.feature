Feature: Exam Management
  As a professor
  I want to create, update, and delete exams composed of questions
  So that I can prepare exams for my students

  Scenario: Create an exam with letters answer mode
    Given there is a question "Q1" with alternatives
    When I create an exam titled "Midterm" with answer mode "letters" and question "Q1"
    Then the exam list contains 1 exam
    And the exam title is "Midterm"
    And the exam answer mode is "letters"

  Scenario: Create an exam with powers of 2 answer mode
    Given there is a question "Q1" with alternatives
    When I create an exam titled "Final" with answer mode "powers_of_2" and question "Q1"
    Then the exam answer mode is "powers_of_2"

  Scenario: Update an exam title
    Given there is an exam titled "Old Title"
    When I update the exam title to "New Title"
    Then the exam title is "New Title"

  Scenario: Delete an exam
    Given there is an exam titled "To Delete"
    When I delete the exam
    Then the exam list contains 0 exams

  Scenario: Cannot create an exam without questions
    When I try to create an exam with no questions
    Then I receive an error

  Scenario: Cannot create an exam with invalid answer mode
    Given there is a question "Q1" with alternatives
    When I try to create an exam with answer mode "invalid"
    Then I receive an error
