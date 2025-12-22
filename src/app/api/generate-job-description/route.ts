import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { subject, level, studentAge, hoursPerWeek, budget, requirements } =
      await request.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    // Use gemini-1.5-flash (faster and more reliable) or gemini-1.5-pro
    // gemini-pro is deprecated
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Generate a professional and detailed job description for a tuition job posting on StudyLinker, an online tuition marketplace. 

Job Details:
- Subject: ${subject || "Not specified"}
- Education Level: ${level || "Not specified"}
- Student Age: ${studentAge || "Not specified"}
- Hours Per Week: ${hoursPerWeek || "Not specified"}
- Budget: ${budget || "Not specified"}
${requirements ? `- Additional Requirements: ${requirements}` : ""}

Please create a comprehensive job description that includes:
1. A clear introduction about what the parent is looking for
2. Specific requirements for the teacher (experience, qualifications, teaching style)
3. Learning goals and objectives for the student
4. Preferred schedule and availability
5. Any additional preferences or expectations

Make it professional, clear, and appealing to qualified teachers. Keep it between 150-250 words.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const description = response.text();

    return NextResponse.json({ description });
  } catch (error) {
    console.error("Error generating job description:", error);
    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 }
    );
  }
}

