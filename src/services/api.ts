import axios from 'axios';
import type { Exam, ExamModeParam, ExamRecord, ExamRecordScore } from '../types/exam';

const DEFAULT_API_BASE_URL = 'http://localhost:12058/api';

const getBaseUrl = () => {
    return localStorage.getItem('exam_api_url') || DEFAULT_API_BASE_URL;
};

const api = axios.create({
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to dynamically set base URL
api.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();
    return config;
});

const textApi = axios.create({
    headers: {
        'Content-Type': 'text/plain',
    },
});

textApi.interceptors.request.use((config) => {
    config.baseURL = getBaseUrl();
    return config;
});


export const examApi = {
    // ExamService (題庫管理)
    addExam: (exam: Exam) => api.post<boolean>('/addExam', exam).then(r => r.data),
    checkExamNm: (name: string) => textApi.post<boolean>('/checkExamNm', name).then(r => r.data),
    getExamList: () => textApi.post<string[]>('/getExamList', '').then(r => r.data), // Doc requires empty string
    getExamListByKeyWord: (keyword: string) => textApi.post<string[]>('/getExamListByKeyWord', keyword).then(r => r.data),
    removeExam: (name: string) => textApi.post<boolean>('/removeExam', name).then(r => r.data),
    getExamByName: (name: string) => textApi.post<Exam>('/getExamByName', name).then(r => r.data),

    // ExamModeService (測驗與紀錄)
    getExamModeQuizzes: (param: ExamModeParam) => api.post<ExamRecord>('/getExamModeQuizzes', param).then(r => r.data),
    commitAnsToRecord: (record: ExamRecord) => api.post<ExamRecord>('/commitAnsToRecord', record).then(r => r.data),
    getScoreById: (id: number) => api.post<ExamRecordScore>('/getScoreById', id).then(r => r.data),
    getScoreByKeyword: (keyword: string) => textApi.post<ExamRecordScore[]>('/getScoreByKeyword', keyword).then(r => r.data),
    deleteRecordScore: (id: number) => api.post<boolean>('/deleteRecordScore', id).then(r => r.data),
    getExamRecordById: (id: number) => api.post<ExamRecord>('/getExamRecordById', id).then(r => r.data),
};
