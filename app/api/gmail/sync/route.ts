import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { extractLoadData } from "@/lib/extract";
import { addLoads, loadLoads } from "@/lib/storage";
import { syncBrokersFromLoads } from "@/lib/crm-storage";

import pdf from "pdf-parse";

export const dynamic = 'force-dynamic';

// Configuration
const MAX_PDFS_PER_SYNC = 20; // Limit to 20 PDFs per sync to avoid quota issues
const DELAY_BETWEEN_PDFS_MS = 1000; // 1 second delay between PDF processing to avoid rate limits

// Helper function to add delay between API calls
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get time range from request body (default to 1 month)
    const body = await request.json().catch(() => ({ timeRange: "1m" }));
    const timeRange = body.timeRange || "1m";
    
    // Calculate date based on time range
    const startDate = new Date();
    switch (timeRange) {
      case "3m":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6m":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "12m":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case "1m":
      default:
        startDate.setMonth(startDate.getMonth() - 1);
        break;
    }
    const afterDate = startDate.toISOString().split('T')[0].replace(/-/g, '/');
    
    console.log(`📅 Syncing Gmail for time range: ${timeRange} (after ${afterDate})`);

    // Set up Gmail API client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });
    
    // Broadened search queries for rate confirmations
    // Cast a wider net to catch various naming conventions
    const queries = [
      // Filename-based searches (specific to common patterns)
      `has:attachment filename:pdf (filename:rate OR filename:confirmation OR filename:load OR filename:tender) after:${afterDate}`,
      `has:attachment filename:pdf (filename:RC OR filename:BOL OR filename:carrier) after:${afterDate}`,
      
      // Subject-based searches (catch emails about rate confirmations)
      `has:attachment filename:pdf (subject:"rate confirmation" OR subject:"load confirmation" OR subject:"carrier confirmation") after:${afterDate}`,
      `has:attachment filename:pdf (subject:rate OR subject:load OR subject:tender OR subject:dispatch) after:${afterDate}`,
      
      // Broker-specific patterns (common broker names)
      `has:attachment filename:pdf (from:tql.com OR from:chrobinson.com OR from:coyote.com OR from:xpo.com OR from:jbhunt.com) after:${afterDate}`,
      `has:attachment filename:pdf (from:landstar.com OR from:schneider.com OR from:werner.com OR from:estes-express.com) after:${afterDate}`,
      
      // Generic "any PDF with freight-related keywords"
      `has:attachment filename:pdf (freight OR trucking OR dispatch OR shipment) after:${afterDate}`,
    ];

    const allMessages: any[] = [];
    
    // Search Gmail for matching emails
    for (const query of queries) {
      let pageToken: string | undefined;
      
      do {
        const response = await gmail.users.messages.list({
          userId: "me",
          q: query,
          maxResults: 500,
          pageToken,
        });

        if (response.data.messages) {
          for (const msg of response.data.messages) {
            if (!allMessages.find(m => m.id === msg.id)) {
              allMessages.push(msg);
            }
          }
        }
        
        pageToken = response.data.nextPageToken || undefined;
      } while (pageToken);
    }

    if (allMessages.length === 0) {
      console.log("📧 No rate confirmation emails found in the last 30 days");
      return NextResponse.json({
        success: true,
        message: "No rate confirmation emails found in the last 30 days",
        stats: {
          emailsScanned: 0,
          pdfsFound: 0,
          extracted: 0,
          duplicates: 0,
          failed: 0,
          skipped: 0,
        },
      });
    }

    console.log(`📧 Found ${allMessages.length} potential email(s) with rate confirmations`);

    // Load existing loads to check for already-processed PDFs
    const existingLoads = await loadLoads(session.user?.email || "unknown");
    const processedFiles = new Set(
      existingLoads
        .filter(load => load.source_file)
        .map(load => load.source_file)
    );
    
    console.log(`📁 Already processed ${processedFiles.size} PDF(s) previously`);

    // Process each email and extract PDFs
    let pdfsFound = 0;
    let pdfsProcessed = 0;
    let extracted = 0;
    let duplicates = 0;
    let skipped = 0;
    let failed = 0;
    let quotaExceeded = false;
    const extractedLoads: any[] = [];

    for (const message of allMessages) {
      // Stop processing if quota exceeded or reached PDF limit
      if (quotaExceeded || pdfsProcessed >= MAX_PDFS_PER_SYNC) {
        if (pdfsProcessed >= MAX_PDFS_PER_SYNC) {
          console.log(`⚠️  Reached limit of ${MAX_PDFS_PER_SYNC} PDFs per sync. Additional PDFs will be processed in next sync.`);
        }
        break;
      }

      try {
        // Get full message details
        const msgData = await gmail.users.messages.get({
          userId: "me",
          id: message.id,
          format: "full",
        });

        const parts = msgData.data.payload?.parts || [];
        
        // Find PDF attachments
        for (const part of parts) {
          if (
            part.filename &&
            part.filename.toLowerCase().endsWith(".pdf") &&
            part.body?.attachmentId
          ) {
            pdfsFound++;

            // Stop processing if quota exceeded or reached PDF limit
            if (quotaExceeded || pdfsProcessed >= MAX_PDFS_PER_SYNC) {
              break;
            }

            // Check if this PDF was already processed
            if (processedFiles.has(part.filename)) {
              console.log(`⏭️  Skipping already processed: ${part.filename}`);
              skipped++;
              continue;
            }

            try {
              console.log(`📄 Processing PDF ${pdfsProcessed + 1}/${Math.min(pdfsFound, MAX_PDFS_PER_SYNC)}: ${part.filename}`);

              // Download attachment
              const attachment = await gmail.users.messages.attachments.get({
                userId: "me",
                messageId: message.id,
                id: part.body.attachmentId,
              });

              if (attachment.data.data) {
                // Decode base64 attachment
                const buffer = Buffer.from(attachment.data.data, "base64");
                
                // Extract text from PDF
                const pdfData = await pdf(buffer);
                const text = pdfData.text;

                if (!text || text.trim().length === 0) {
                  console.log(`❌ Failed to extract text from: ${part.filename}`);
                  failed++;
                  pdfsProcessed++;
                  continue;
                }

                // Extract load data using AI
                console.log(`🤖 Extracting load data from: ${part.filename}`);
                const loadData = await extractLoadData(text);
                loadData.source_file = part.filename;
                loadData.extracted_at = new Date().toISOString();

                if (loadData && loadData.load_id) {
                  extractedLoads.push(loadData);
                  console.log(`✅ Successfully extracted load: ${loadData.load_id} from ${part.filename}`);
                } else {
                  console.log(`⚠️  Extracted data but missing load_id from: ${part.filename}`);
                  failed++;
                }

                pdfsProcessed++;

                // Add delay between API calls to avoid rate limits
                if (pdfsProcessed < MAX_PDFS_PER_SYNC && !quotaExceeded) {
                  await delay(DELAY_BETWEEN_PDFS_MS);
                }
              }
            } catch (pdfError: any) {
              console.error(`❌ Error processing PDF ${part.filename}:`, pdfError.message);
              
              // Check if quota exceeded
              if (pdfError?.message === "QUOTA_EXCEEDED") {
                console.log(`🚫 OpenAI API quota exceeded. Processed ${pdfsProcessed} PDF(s) before hitting limit.`);
                quotaExceeded = true;
                break;
              }
              
              // Continue processing other PDFs even if this one failed
              failed++;
              pdfsProcessed++;
            }
          }
        }
      } catch (msgError: any) {
        console.error(`❌ Error processing message ${message.id}:`, msgError.message);
        // Continue processing other messages even if this one failed
      }
    }

    console.log(`\n📊 Processing Summary:`);
    console.log(`   Emails scanned: ${allMessages.length}`);
    console.log(`   PDFs found: ${pdfsFound}`);
    console.log(`   PDFs processed: ${pdfsProcessed}`);
    console.log(`   PDFs skipped (already processed): ${skipped}`);
    console.log(`   Loads extracted: ${extractedLoads.length}`);
    console.log(`   Failed: ${failed}`);

    // Save to storage with user email as identifier
    if (extractedLoads.length > 0) {
      console.log(`💾 Saving ${extractedLoads.length} load(s) to database...`);
      const { addedCount, duplicateCount, updatedCount } = await addLoads(
        extractedLoads,
        session.user?.email || "unknown"
      );
      extracted = addedCount;
      duplicates = duplicateCount;
      const refreshed = updatedCount;

      console.log(`✅ Database updated: ${addedCount} added, ${updatedCount} refreshed, ${duplicateCount} duplicates`);

      // Build response with quota warning if applicable
      const response: any = {
        success: true,
        stats: {
          emailsScanned: allMessages.length,
          pdfsFound,
          pdfsProcessed,
          skipped,
          extracted: addedCount,
          refreshed,
          duplicates: duplicateCount,
          failed,
        },
        loads: extractedLoads,
      };

      if (quotaExceeded) {
        response.warning = "QUOTA_EXCEEDED";
        response.message = `Successfully processed ${addedCount} load(s), but OpenAI API quota was exceeded. Please check your OpenAI billing at https://platform.openai.com/account/billing or try again later.`;
        console.log(`⚠️  ${response.message}`);
      }

      if (pdfsProcessed >= MAX_PDFS_PER_SYNC) {
        response.message = `Processed ${MAX_PDFS_PER_SYNC} PDFs (limit per sync). Run sync again to process remaining PDFs.`;
        console.log(`ℹ️  ${response.message}`);
      }

      return NextResponse.json(response);
    }

    // If quota exceeded and no loads extracted
    if (quotaExceeded) {
      console.log(`🚫 No loads extracted due to quota exceeded`);
      return NextResponse.json({
        success: false,
        error: "OpenAI API quota exceeded. Please check your OpenAI account billing at https://platform.openai.com/account/billing and ensure you have credits available.",
        stats: {
          emailsScanned: allMessages.length,
          pdfsFound,
          pdfsProcessed,
          skipped,
          extracted: 0,
          refreshed: 0,
          duplicates: 0,
          failed,
        },
      }, { status: 429 });
    }

    console.log(`✅ Sync complete`);
    return NextResponse.json({
      success: true,
      message: skipped > 0 ? `${skipped} PDF(s) were already processed. No new loads found.` : "No new loads found.",
      stats: {
        emailsScanned: allMessages.length,
        pdfsFound,
        pdfsProcessed,
        skipped,
        extracted,
        refreshed: 0,
        duplicates,
        failed,
      },
      loads: extractedLoads,
    });

  } catch (error: any) {
    console.error("Gmail sync error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync Gmail" },
      { status: 500 }
    );
  }
}

