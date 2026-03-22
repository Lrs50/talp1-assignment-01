Feature: Exam Correction
  As a professor
  I want to correct student responses against an answer key
  So that I can produce a grade report for the class

  Scenario: Strict correction - all correct
    Given an answer key with version 1 answers "A,B"
    And student "Alice" CPF "111" version 1 answered "A,B"
    When I correct the exam in "strict" mode
    Then Alice's total score is 2 out of 2

  Scenario: Strict correction - one wrong answer
    Given an answer key with version 1 answers "A,B"
    And student "Bob" CPF "222" version 1 answered "A,C"
    When I correct the exam in "strict" mode
    Then Bob's total score is 1 out of 2

  Scenario: Strict correction - all wrong
    Given an answer key with version 1 answers "A,B"
    And student "Carol" CPF "333" version 1 answered "C,D"
    When I correct the exam in "strict" mode
    Then Carol's total score is 0 out of 2

  Scenario: Partial correction with powers of 2 - fully correct
    Given an answer key with version 1 answers "3"
    And student "Dave" CPF "444" version 1 answered "3"
    When I correct the exam in "partial" mode for powers_of_2
    Then Dave's total score is 1 out of 1

  Scenario: Partial correction with powers of 2 - half correct
    Given an answer key with version 1 answers "3"
    And student "Eve" CPF "555" version 1 answered "1"
    When I correct the exam in "partial" mode for powers_of_2
    Then Eve's total score is 0.5 out of 1

  Scenario: Multiple students in one correction run
    Given an answer key with version 1 answers "A"
    And student "Alice" CPF "111" version 1 answered "A"
    And student "Bob" CPF "222" version 1 answered "B"
    When I correct the exam in "strict" mode
    Then the grade report contains 2 students
