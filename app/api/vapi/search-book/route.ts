import { NextResponse } from 'next/server';
import { searchBookSegments } from '@/lib/actions/book.actions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const toolCallList = body?.message?.toolWithToolCallList || [];
    
    const results = [];

    for (const item of toolCallList) {
      const toolCall = item.toolCall;
      if (!toolCall) continue;
      
      const functionName = toolCall.function?.name;
      
      if (functionName === 'search_book' || functionName === 'search book') {
        const args = toolCall.function?.arguments || {};
        const { bookId, query } = args;
        
        let resultString = "no information found about this topic.";
        
        if (bookId && query) {
          const res = await searchBookSegments(bookId, query, 3);
          
          if (res.success && res.data && res.data.length > 0) {
            resultString = res.data.map((seg: any) => seg.content).join('\n\n');
          }
        }
        
        results.push({
          toolCallId: toolCall.id,
          result: resultString
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('Error in Vapi search-book route:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
