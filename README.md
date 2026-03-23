# Kotae

A web-based system for creating, randomizing, and grading exams.

## What It Does

The Exam System allows educators to:

- **Create questions** with multiple alternatives
- **Create exams** by selecting and organizing questions
- **Generate PDF exams** with randomized question orders and multiple versions
- **Grade exams** by uploading answer sheets and correcting them
- **View reports** with detailed statistics and student performance data

## Main Workflows

### 1. Create Questions

- Go to "Questions" section
- Add questions with multiple answer options
- Mark the correct answer
- Questions are saved to the question bank

### 2. Create Exams

- Go to "Exams" section
- Select questions from the question bank
- Configure exam settings (answer mode: letters or powers of 2)
- Save the exam

### 3. Generate Exams

- From the exam list, click "Generate PDF"
- Specify number of versions to generate
- Download ZIP file with multiple exam versions
- Each version has randomized question order

### 4. Grade Exams

- Go to "Correction" section
- Upload answer key and student response CSVs
- Select correction mode (strict or partial scoring)
- View detailed results and statistics

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm

### Installation

```bash
cd talp1-assignment-01
npm run setup
```

### Running the System

Start both backend and frontend:

```bash
npm run dev
```

This starts:

- **Backend**: http://localhost:3001
- **Frontend**: http://localhost:5173

### Running Tests

```bash
npm test
```

Runs all Cucumber acceptance tests.

## Project Structure

```
sistema/
├── backend/          # Node.js + Express server
│   └── src/
│       ├── controllers/    # HTTP endpoints
│       ├── services/       # Business logic
│       └── repositories/   # Data access
├── frontend/         # React + Vite application
│   └── src/
│       ├── pages/         # Page components
│       └── components/    # Reusable components
└── tests/            # Cucumber acceptance tests
    └── features/    # Test scenarios
```

## Features

- **Multiple exam versions** with automatic question randomization
- **Answer key management** for both letter and powers-of-2 answer modes
- **CSV upload** for bulk exam correction
- **Flexible scoring modes**: strict or partial credit
- **Performance statistics**: averages, medians, distributions
- **PDF generation**: professional exam documents
- **PDF preview** with zoom controls before generation
- **Correction reporting** with student scores and grades
- **Responsive UI**: works on desktop and tablet

## Design Principles

This project follows a philosophy of simplicity and clarity:

- **Readable code** - prefer explicit over clever
- **Small functions** - each does one thing well
- **Clear structure** - business logic separate from UI
- **Minimal abstractions** - only when needed

See `AGENTS.md` for full development guidelines.
