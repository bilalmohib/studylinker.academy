/**
 * Database Types
 * Generated types for Supabase database schema
 * Update these when schema changes
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      UserProfile: {
        Row: {
          id: string;
          clerkId: string;
          email: string;
          firstName: string | null;
          lastName: string | null;
          avatar: string | null;
          role: "PARENT" | "TEACHER";
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          clerkId: string;
          email: string;
          firstName?: string | null;
          lastName?: string | null;
          avatar?: string | null;
          role?: "PARENT" | "TEACHER";
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          clerkId?: string;
          email?: string;
          firstName?: string | null;
          lastName?: string | null;
          avatar?: string | null;
          role?: "PARENT" | "TEACHER";
          createdAt?: string;
          updatedAt?: string;
        };
      };
      TeacherProfile: {
        Row: {
          id: string;
          userId: string;
          bio: string | null;
          location: string | null;
          timezone: string | null;
          languages: string[] | null;
          hourlyRate: number | null;
          currency: string | null;
          rating: number | null;
          totalReviews: number;
          totalStudents: number;
          verified: boolean;
          badge: string | null;
          availability: Json | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          userId: string;
          bio?: string | null;
          location?: string | null;
          timezone?: string | null;
          languages?: string[] | null;
          hourlyRate?: number | null;
          currency?: string | null;
          rating?: number | null;
          totalReviews?: number;
          totalStudents?: number;
          verified?: boolean;
          badge?: string | null;
          availability?: Json | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          bio?: string | null;
          location?: string | null;
          timezone?: string | null;
          languages?: string[] | null;
          hourlyRate?: number | null;
          currency?: string | null;
          rating?: number | null;
          totalReviews?: number;
          totalStudents?: number;
          verified?: boolean;
          badge?: string | null;
          availability?: Json | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      ParentProfile: {
        Row: {
          id: string;
          userId: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          userId: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          userId?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Student: {
        Row: {
          id: string;
          parentId: string;
          firstName: string;
          lastName: string | null;
          age: number | null;
          grade: string | null;
          avatar: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          parentId: string;
          firstName: string;
          lastName?: string | null;
          age?: number | null;
          grade?: string | null;
          avatar?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          parentId?: string;
          firstName?: string;
          lastName?: string | null;
          age?: number | null;
          grade?: string | null;
          avatar?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      JobPosting: {
        Row: {
          id: string;
          parentId: string;
          title: string;
          subject: string;
          level: string;
          studentAge: number | null;
          hoursPerWeek: string;
          budget: string;
          description: string;
          requirements: string[] | null;
          curriculum: boolean;
          applicationMode: "OPEN" | "CURATED";
          status: "OPEN" | "CLOSED" | "FILLED" | "CANCELLED";
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          parentId: string;
          title: string;
          subject: string;
          level: string;
          studentAge?: number | null;
          hoursPerWeek: string;
          budget: string;
          description: string;
          requirements?: string[] | null;
          curriculum?: boolean;
          applicationMode?: "OPEN" | "CURATED";
          status?: "OPEN" | "CLOSED" | "FILLED" | "CANCELLED";
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          parentId?: string;
          title?: string;
          subject?: string;
          level?: string;
          studentAge?: number | null;
          hoursPerWeek?: string;
          budget?: string;
          description?: string;
          requirements?: string[] | null;
          curriculum?: boolean;
          applicationMode?: "OPEN" | "CURATED";
          status?: "OPEN" | "CLOSED" | "FILLED" | "CANCELLED";
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Application: {
        Row: {
          id: string;
          jobId: string;
          teacherId: string;
          proposedRate: number | null;
          coverLetter: string | null;
          status: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          jobId: string;
          teacherId: string;
          proposedRate?: number | null;
          coverLetter?: string | null;
          status?: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          jobId?: string;
          teacherId?: string;
          proposedRate?: number | null;
          coverLetter?: string | null;
          status?: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN";
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Contract: {
        Row: {
          id: string;
          parentId: string;
          teacherId: string;
          studentId: string;
          jobId: string | null;
          subject: string;
          level: string;
          rate: number;
          currency: string;
          hoursPerWeek: string;
          schedule: Json | null;
          curriculum: boolean;
          status: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
          startDate: string;
          endDate: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          parentId: string;
          teacherId: string;
          studentId: string;
          jobId?: string | null;
          subject: string;
          level: string;
          rate: number;
          currency?: string;
          hoursPerWeek: string;
          schedule?: Json | null;
          curriculum?: boolean;
          status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
          startDate: string;
          endDate?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          parentId?: string;
          teacherId?: string;
          studentId?: string;
          jobId?: string | null;
          subject?: string;
          level?: string;
          rate?: number;
          currency?: string;
          hoursPerWeek?: string;
          schedule?: Json | null;
          curriculum?: boolean;
          status?: "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
          startDate?: string;
          endDate?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Class: {
        Row: {
          id: string;
          contractId: string;
          teacherId: string;
          studentId: string;
          title: string;
          description: string | null;
          scheduledAt: string;
          duration: number;
          status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
          meetingLink: string | null;
          notes: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          contractId: string;
          teacherId: string;
          studentId: string;
          title: string;
          description?: string | null;
          scheduledAt: string;
          duration: number;
          status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
          meetingLink?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          contractId?: string;
          teacherId?: string;
          studentId?: string;
          title?: string;
          description?: string | null;
          scheduledAt?: string;
          duration?: number;
          status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "MISSED";
          meetingLink?: string | null;
          notes?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      ProgressReport: {
        Row: {
          id: string;
          contractId: string;
          teacherId: string;
          studentId: string;
          title: string;
          content: string;
          grade: string | null;
          attendance: number | null;
          performance: Json | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          contractId: string;
          teacherId: string;
          studentId: string;
          title: string;
          content: string;
          grade?: string | null;
          attendance?: number | null;
          performance?: Json | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          contractId?: string;
          teacherId?: string;
          studentId?: string;
          title?: string;
          content?: string;
          grade?: string | null;
          attendance?: number | null;
          performance?: Json | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Assessment: {
        Row: {
          id: string;
          studentId: string;
          title: string;
          subject: string;
          level: string;
          type: "QUIZ" | "EXAM" | "ASSIGNMENT" | "PROJECT";
          score: number | null;
          maxScore: number;
          percentage: number | null;
          grade: string | null;
          feedback: string | null;
          takenAt: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          studentId: string;
          title: string;
          subject: string;
          level: string;
          type: "QUIZ" | "EXAM" | "ASSIGNMENT" | "PROJECT";
          score?: number | null;
          maxScore: number;
          percentage?: number | null;
          grade?: string | null;
          feedback?: string | null;
          takenAt: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          studentId?: string;
          title?: string;
          subject?: string;
          level?: string;
          type?: "QUIZ" | "EXAM" | "ASSIGNMENT" | "PROJECT";
          score?: number | null;
          maxScore?: number;
          percentage?: number | null;
          grade?: string | null;
          feedback?: string | null;
          takenAt?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Review: {
        Row: {
          id: string;
          contractId: string;
          parentId: string;
          teacherId: string;
          rating: number;
          comment: string | null;
          anonymous: boolean;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          contractId: string;
          parentId: string;
          teacherId: string;
          rating: number;
          comment?: string | null;
          anonymous?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          contractId?: string;
          parentId?: string;
          teacherId?: string;
          rating?: number;
          comment?: string | null;
          anonymous?: boolean;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Message: {
        Row: {
          id: string;
          senderId: string;
          receiverId: string;
          contractId: string | null;
          content: string;
          read: boolean;
          readAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          senderId: string;
          receiverId: string;
          contractId?: string | null;
          content: string;
          read?: boolean;
          readAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          senderId?: string;
          receiverId?: string;
          contractId?: string | null;
          content?: string;
          read?: boolean;
          readAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Payment: {
        Row: {
          id: string;
          contractId: string;
          amount: number;
          currency: string;
          status: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
          paymentMethod: string | null;
          transactionId: string | null;
          paidAt: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          contractId: string;
          amount: number;
          currency?: string;
          status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
          paymentMethod?: string | null;
          transactionId?: string | null;
          paidAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          contractId?: string;
          amount?: number;
          currency?: string;
          status?: "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
          paymentMethod?: string | null;
          transactionId?: string | null;
          paidAt?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      Qualification: {
        Row: {
          id: string;
          teacherId: string;
          title: string;
          institution: string | null;
          year: number | null;
          certificate: string | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          teacherId: string;
          title: string;
          institution?: string | null;
          year?: number | null;
          certificate?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          teacherId?: string;
          title?: string;
          institution?: string | null;
          year?: number | null;
          certificate?: string | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      TeacherSubject: {
        Row: {
          id: string;
          teacherId: string;
          subject: string;
          experience: number | null;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          teacherId: string;
          subject: string;
          experience?: number | null;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          teacherId?: string;
          subject?: string;
          experience?: number | null;
          createdAt?: string;
          updatedAt?: string;
        };
      };
      TeacherLevel: {
        Row: {
          id: string;
          teacherId: string;
          level: string;
          createdAt: string;
          updatedAt: string;
        };
        Insert: {
          id: string;
          teacherId: string;
          level: string;
          createdAt?: string;
          updatedAt?: string;
        };
        Update: {
          id?: string;
          teacherId?: string;
          level?: string;
          createdAt?: string;
          updatedAt?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

