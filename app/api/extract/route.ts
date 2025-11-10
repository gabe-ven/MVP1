import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pdf from "pdf-parse";
import { extractLoadData } from "@/lib/extract";
import { addLoads } from "@/lib/storage";

// CORS headers for Chrome extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * OPTIONS handler for CORS preflight
 */
export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { headers: corsHeaders });
}

/**
 * POST /api/extract
 * Accepts PDF files, extracts text, processes with OpenAI, and stores results
 */
export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated (optional - still works without auth for backward compatibility)
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    
    // Parse the multipart form data
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500, headers: corsHeaders }
      );
    }

    const extractedLoads = [];
    const errors = [];
    const duplicates = [];

    // Process each PDF file
    for (const file of files) {
      try {
        console.log(`Processing file: ${file.name}`);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Extract text from PDF
        const pdfData = await pdf(buffer);
        const pdfText = pdfData.text;

        if (!pdfText || pdfText.trim().length === 0) {
          errors.push({
            filename: file.name,
            error: "No text found in PDF",
          });
          continue;
        }

        console.log(`Extracted ${pdfText.length} characters from ${file.name}`);

        // Extract structured data using OpenAI
        const loadData = await extractLoadData(pdfText);

        // Add filename for reference
        loadData.source_file = file.name;
        loadData.extracted_at = new Date().toISOString();

        extractedLoads.push(loadData);
      } catch (fileError: any) {
        console.error(`Error processing ${file.name}:`, fileError);
        errors.push({
          filename: file.name,
          error: fileError.message || "Failed to process file",
        });
      }
    }

    // Check for duplicates and save to storage
    let addedCount = 0;
    if (extractedLoads.length > 0) {
      const { loadLoads } = await import("@/lib/storage");
      const existingLoads = await loadLoads(userEmail || undefined);
      const existingLoadIds = new Set(existingLoads.map(load => load.load_id));
      
      // Separate new loads from duplicates
      const newLoads = [];
      for (const load of extractedLoads) {
        if (existingLoadIds.has(load.load_id)) {
          duplicates.push({
            load_id: load.load_id,
            filename: load.source_file,
          });
        } else {
          newLoads.push(load);
        }
      }
      
      // Only save new loads
      if (newLoads.length > 0) {
        await addLoads(newLoads, userEmail || undefined);
        addedCount = newLoads.length;
      }
    }

    // Return results
    return NextResponse.json({
      success: true,
      extracted: addedCount,
      failed: errors.length,
      duplicates: duplicates.length,
      loads: extractedLoads,
      errors: errors.length > 0 ? errors : undefined,
      duplicateDetails: duplicates.length > 0 ? duplicates : undefined,
    }, { headers: corsHeaders });
  } catch (error: any) {
    console.error("Error in extract API:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

