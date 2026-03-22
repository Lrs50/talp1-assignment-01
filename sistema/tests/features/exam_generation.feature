Feature: Exam Generation
  As a professor
  I want to generate multiple randomized versions of an exam
  So that students sitting next to each other have different question orders

  Scenario: Generate exam versions as a ZIP file
    Given there is an exam "Math Test" with 2 questions and answer mode "letters"
    When I generate 3 versions of the exam with header info
    Then I receive a ZIP file
    And the ZIP contains 3 PDF files
    And the ZIP contains an answer key CSV

  Scenario: Answer key CSV contains one row per version
    Given there is an exam "Science Test" with 2 questions and answer mode "letters"
    When I generate 2 versions of the exam with header info
    Then the answer key CSV has 2 data rows

  Scenario: Answer key uses letters for letters mode
    Given there is an exam with answer mode "letters" and 1 question with 3 alternatives
    When I generate 1 version of the exam
    Then the answer key answer is a single letter

  Scenario: Answer key uses numeric sum for powers of 2 mode
    Given there is an exam with answer mode "powers_of_2" and 1 question with correct alternatives at positions 0 and 1
    When I generate 1 version of the exam
    Then the answer key answer is a numeric sum
