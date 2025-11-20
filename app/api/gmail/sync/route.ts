import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { google } from "googleapis";
import { extractLoadData } from "@/lib/extract";
import { addLoads, loadLoads } from "@/lib/storage";
import { syncBrokersFromLoads } from "@/lib/crm-storage";
import pdf from "pdf-parse";

export const dynamic = 'force-dynamic';

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

    // Set up Gmail API client
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    
    const gmail = google.gmail({ version: "v1", auth: oauth2Client });

    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const afterDate = thirtyDaysAgo.toISOString().split('T')[0].replace(/-/g, '/');
    
    // Search queries for rate confirmations
    const queries = [
      `has:attachment filename:pdf filename:rate filename:confirmation after:${afterDate}`,
      `has:attachment filename:pdf filename:load filename:confirmation after:${afterDate}`,
      `has:attachment filename:pdf filename:carrier filename:rate after:${afterDate}`,
      `has:attachment filename:pdf filename:freight filename:confirmation after:${afterDate}`,
      `has:attachment filename:pdf filename:rate filename:sheet after:${afterDate}`,
      `has:attachment filename:pdf filename:load filename:tender after:${afterDate}`,
      `has:attachment filename:pdf filename:rate after:${afterDate}`,
      `has:attachment filename:pdf subject:rate subject:confirmation after:${afterDate}`
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
      return NextResponse.json({
        success: true,
        message: "No rate confirmation emails found in the last 30 days",
        stats: {
          emailsScanned: 0,
          pdfsFound: 0,
          extracted: 0,
          duplicates: 0,
          failed: 0,
        },
      });
    }

    // Process each email and extract PDFs
    let pdfsFound = 0;
    let extracted = 0;
    let duplicates = 0;
    let failed = 0;
    let quotaExceeded = false;
    const extractedLoads: any[] = [];

    for (const message of allMessages) {
      // Stop processing if quota exceeded
      if (quotaExceeded) {
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

            // Stop processing if quota exceeded
            if (quotaExceeded) {
              break;
            }

            try {
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
                  failed++;
                  continue;
                }

                // Extract load data using AI
                const loadData = await extractLoadData(text);
                loadData.source_file = part.filename;
                loadData.extracted_at = new Date().toISOString();

                if (loadData) {
                  extractedLoads.push(loadData);
                }
              }
            } catch (pdfError: any) {
              console.error(`Error processing PDF ${part.filename}:`, pdfError);
              
              // Check if quota exceeded
              if (pdfError?.message === "QUOTA_EXCEEDED") {
                quotaExceeded = true;
                break;
              }
              
              failed++;
            }
          }
        }
      } catch (msgError) {
        console.error(`Error processing message ${message.id}:`, msgError);
      }
    }

    // Save to storage with user email as identifier
    if (extractedLoads.length > 0) {
      const { addedCount, duplicateCount, updatedCount } = await addLoads(
        extractedLoads,
        session.user?.email || "unknown"
      );
      extracted = addedCount;
      duplicates = duplicateCount;
      const refreshed = updatedCount;

      // Auto-sync brokers from all loads (in the background, don't block response)
      if (session.user?.email) {
        loadLoads(session.user.email)
          .then((allLoads) => syncBrokersFromLoads(allLoads, session.user!.email))
          .catch((error) => {
            console.error("Background broker sync failed:", error);
          });
      }

      // Build response with quota warning if applicable
      const response: any = {
        success: true,
        stats: {
          emailsScanned: allMessages.length,
          pdfsFound,
          extracted: addedCount,
          refreshed,
          duplicates: duplicateCount,
          failed: pdfsFound - addedCount - duplicateCount - refreshed,
        },
        loads: extractedLoads,
      };

      if (quotaExceeded) {
        response.warning = "QUOTA_EXCEEDED";
        response.message = `Successfully processed ${addedCount} load(s), but OpenAI API quota was exceeded. Please check your OpenAI billing at https://platform.openai.com/account/billing or try again later.`;
      }

      return NextResponse.json(response);
    }

    // If quota exceeded and no loads extracted
    if (quotaExceeded) {
      return NextResponse.json({
        success: false,
        error: "OpenAI API quota exceeded. Please check your OpenAI account billing at https://platform.openai.com/account/billing and ensure you have credits available.",
        stats: {
          emailsScanned: allMessages.length,
          pdfsFound,
          extracted: 0,
          refreshed: 0,
          duplicates: 0,
          failed: pdfsFound,
        },
      }, { status: 429 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        emailsScanned: allMessages.length,
        pdfsFound,
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

