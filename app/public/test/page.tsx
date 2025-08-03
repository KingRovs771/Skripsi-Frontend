"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { mockQuestions, likertScale } from "@/lib/data";

export default function MentalTestPage() {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const progress = (currentQuestionIndex / mockQuestions.length) * 100;

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      // Di aplikasi nyata, Anda akan mengirim 'answers' ke server
      // lalu mengarahkan ke halaman hasil dengan ID hasil tes
      router.push("/tes/hasil");
    }
  };

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Tes Kesehatan Mental</CardTitle>
          <CardDescription>
            Dalam 2 minggu terakhir, seberapa sering Anda terganggu oleh masalah
            berikut?
          </CardDescription>
          <div className="mt-4">
            <Progress value={progress} />
            <p className="text-sm text-slate-500 mt-2">
              Pertanyaan {currentQuestionIndex + 1} dari {mockQuestions.length}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium mb-6 text-center">
            &quot;{currentQuestion.text}&quot;
          </p>
          <div className="space-y-3">
            {likertScale.map((option) => (
              <div
                key={option.value}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                  answers[currentQuestion.id] === option.value
                    ? "bg-blue-100 border-blue-500 ring-2 ring-blue-500"
                    : "border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                }`}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.value}
                  checked={answers[currentQuestion.id] === option.value}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                  readOnly
                />
                <label className="ml-3 block text-sm font-medium text-gray-900 w-full cursor-pointer">
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={handleNext}
            disabled={!answers[currentQuestion.id]}
            className="w-full py-3 text-base"
          >
            {currentQuestionIndex < mockQuestions.length - 1
              ? "Selanjutnya"
              : "Selesai & Lihat Hasil"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
