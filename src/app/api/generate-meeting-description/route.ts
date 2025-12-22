import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { teacherName, interviewDate, subjects, levels } = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    let formattedDate = "TBD";
    if (interviewDate) {
      try {
        const date = new Date(interviewDate);
        if (!isNaN(date.getTime())) {
          formattedDate = date.toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        }
      } catch (dateError) {
        console.warn("Error formatting date:", dateError);
        formattedDate = interviewDate; // Fallback to raw value
      }
    }

    const prompt = `Generate a professional and concise meeting description for a teacher interview on StudyLinker Academy, an online tuition marketplace.

Interview Details:
- Teacher Name: ${teacherName || "Applicant"}
- Interview Date & Time: ${formattedDate}
- Subjects: ${subjects?.join(", ") || "Not specified"}
- Education Levels: ${levels?.join(", ") || "Not specified"}

Please create a professional meeting description that includes:
1. A welcoming introduction
2. Brief overview of what will be discussed (teaching experience, qualifications, teaching approach)
3. What to expect during the interview
4. Any preparation suggestions

Make it professional, clear, and friendly. Keep it between 100-150 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();

    if (!description || description.trim().length === 0) {
      throw new Error("Empty response from Gemini API");
    }

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error generating meeting description:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to generate meeting description",
        details: errorMessage 
      },
      { status: 500 }
    );
  }
}

