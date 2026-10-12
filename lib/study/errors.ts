/** Thrown when study logic receives input it cannot act on. The message is shown to the student. */
export class StudyInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudyInputError";
  }
}
