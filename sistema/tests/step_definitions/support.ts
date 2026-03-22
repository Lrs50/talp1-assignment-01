/**
 * Cucumber World setup.
 * Tests run against the backend HTTP API — no direct DB access needed here.
 */
import { setWorldConstructor, World } from "@cucumber/cucumber";

class ExamWorld extends World {}

setWorldConstructor(ExamWorld);
