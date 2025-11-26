import { db, storage } from '../config/firebase';
import { ref as dbRef, get, set, push } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';

export interface QuestionnaireAnswer {
  id: string;
  questionId: string;
  answer: string;
  fileUrls?: string[];
  createdAt: string;
}

export interface Questionnaire {
  id: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt: string;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'file' | 'audio' | 'single-choice' | 'multiple-choice';
  required: boolean;
  options?: string[];
}

export interface QuestionnaireSubmission {
  id: string;
  questionnaireId: string;
  answers: QuestionnaireAnswer[];
  submittedAt: string;
}

// Get a specific questionnaire by ID
export async function getQuestionnaire(id: string): Promise<Questionnaire | null> {
  const questionnaireRef = dbRef(db, `questionnaires/${id}`);
  const snapshot = await get(questionnaireRef);

  if (snapshot.exists()) {
    return snapshot.val();
  }

  return null;
}

// Save questionnaire submission
export async function submitQuestionnaire(
  questionnaireId: string,
  answers: QuestionnaireAnswer[]
): Promise<string> {
  const submissionsRef = dbRef(db, `submissions/${questionnaireId}`);
  const newSubmissionRef = push(submissionsRef);

  const submission: QuestionnaireSubmission = {
    id: newSubmissionRef.key || uuidv4(),
    questionnaireId,
    answers,
    submittedAt: new Date().toISOString()
  };

  await set(newSubmissionRef, submission);
  return submission.id;
}

// Upload file to Firebase Storage
export async function uploadFile(
  file: File,
  questionnaireId: string,
  questionId: string
): Promise<string> {
  const fileExtension = file.name.split('.').pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const filePath = `questionnaires/${questionnaireId}/${questionId}/${fileName}`;

  const fileRef = storageRef(storage, filePath);
  await uploadBytes(fileRef, file);

  const downloadURL = await getDownloadURL(fileRef);
  return downloadURL;
}

// Upload multiple files
export async function uploadFiles(
  files: File[],
  questionnaireId: string,
  questionId: string
): Promise<string[]> {
  const uploadPromises = files.map(file =>
    uploadFile(file, questionnaireId, questionId)
  );

  return Promise.all(uploadPromises);
}

// Create a new questionnaire
export async function createQuestionnaire(
  title: string,
  description: string,
  questions: Omit<Question, 'id'>[]
): Promise<string> {
  const id = uuidv4();
  const questionnaireRef = dbRef(db, `questionnaires/${id}`);

  const questionnaire: Questionnaire = {
    id,
    title,
    description,
    questions: questions.map((q, index) => {
      const question: Question = {
        id: `q${index + 1}`,
        text: q.text,
        type: q.type,
        required: q.required
      };

      // Only add options if they exist and the type requires them
      if ((q.type === 'single-choice' || q.type === 'multiple-choice') && q.options && q.options.length > 0) {
        question.options = q.options;
      }

      return question;
    }),
    createdAt: new Date().toISOString()
  };

  await set(questionnaireRef, questionnaire);
  return id;
}

// Update an existing questionnaire
export async function updateQuestionnaire(
  id: string,
  title: string,
  description: string,
  questions: Omit<Question, 'id'>[]
): Promise<void> {
  const questionnaireRef = dbRef(db, `questionnaires/${id}`);

  // Get the existing questionnaire to preserve createdAt
  const existing = await getQuestionnaire(id);

  const questionnaire: Questionnaire = {
    id,
    title,
    description,
    questions: questions.map((q, index) => {
      const question: Question = {
        id: `q${index + 1}`,
        text: q.text,
        type: q.type,
        required: q.required
      };

      // Only add options if they exist and the type requires them
      if ((q.type === 'single-choice' || q.type === 'multiple-choice') && q.options && q.options.length > 0) {
        question.options = q.options;
      }

      return question;
    }),
    createdAt: existing?.createdAt || new Date().toISOString()
  };

  await set(questionnaireRef, questionnaire);
}

// Get all questionnaires
export async function getAllQuestionnaires(): Promise<Questionnaire[]> {
  const questionnairesRef = dbRef(db, 'questionnaires');
  const snapshot = await get(questionnairesRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data);
  }

  return [];
}

// Get submissions for a questionnaire
export async function getSubmissions(questionnaireId: string): Promise<QuestionnaireSubmission[]> {
  const submissionsRef = dbRef(db, `submissions/${questionnaireId}`);
  const snapshot = await get(submissionsRef);

  if (snapshot.exists()) {
    const data = snapshot.val();
    return Object.values(data);
  }

  return [];
}
